import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"
import { handleLoginEvent, createActiveSession } from "./security-notifications"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      onboardingCompleted: boolean
      phoneVerified: boolean
      sessionTerminated?: boolean
    }
  }

  interface User {
    role: UserRole
    onboardingCompleted: boolean
    phoneVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    onboardingCompleted: boolean
    phoneVerified: boolean
    sessionCreatedAt?: number
    sessionTerminated?: boolean
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for custom domains on Vercel
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Use default cookie configuration - NextAuth handles this automatically
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) {
            await handleLoginEvent({
              userId: '',
              userEmail: email,
              success: false,
              reason: 'User not found or no password',
            }).catch(console.error)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            await handleLoginEvent({
              userId: user.id,
              userEmail: email,
              userName: user.name ?? undefined,
              success: false,
              reason: 'Invalid password',
            }).catch(console.error)
            return null
          }

          await handleLoginEvent({
            userId: user.id,
            userEmail: email,
            userName: user.name ?? undefined,
            success: true,
          }).catch(console.error)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
            phoneVerified: user.phoneVerified,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role
        token.onboardingCompleted = user.onboardingCompleted
        token.phoneVerified = user.phoneVerified
        token.sessionCreatedAt = Date.now() // Timestamp für Session-Invalidierung
      }

      // Update token when session is updated
      if (trigger === "update" && session) {
        token.role = session.user.role
        token.onboardingCompleted = session.user.onboardingCompleted
        if (session.user.phoneVerified !== undefined) {
          token.phoneVerified = session.user.phoneVerified
        }
      }

      // Prüfe ob User noch aktive Session hat (für Session-Invalidierung)
      // WICHTIG: Überspringe diese Prüfung bei neuem Login (user ist gesetzt)
      // da die activeSession erst im signIn Event erstellt wird
      if (token.id && !user) {
        try {
          const activeSession = await prisma.activeSession.findFirst({
            where: {
              userId: token.id as string,
              isActive: true,
              expiresAt: { gte: new Date() },
            },
          })
          
          // Wenn keine aktive Session mehr existiert, Token invalidieren
          if (!activeSession) {
            // Prüfe ob der User überhaupt Sessions hatte (neue User haben keine)
            const anySession = await prisma.activeSession.findFirst({
              where: { userId: token.id as string },
            })
            
            // Nur invalidieren wenn Sessions existierten aber keine mehr aktiv ist
            if (anySession) {
              // Setze ein Flag dass die Session beendet wurde
              token.sessionTerminated = true
            }
          }
        } catch (error) {
          // Bei DB-Fehlern Session nicht invalidieren
          console.error('Session check error:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // Wenn Session terminiert wurde, leere Session zurückgeben
      if (token.sessionTerminated) {
        return { ...session, user: { ...session.user, sessionTerminated: true } }
      }
      
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.onboardingCompleted = token.onboardingCompleted
        session.user.phoneVerified = token.phoneVerified
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      // Erstelle ActiveSession bei erfolgreichem Login
      if (user?.id && account?.provider) {
        try {
          const sessionToken = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`
          await createActiveSession(user.id, sessionToken)
          
          // Log für OAuth-Logins (Credentials werden in authorize geloggt)
          if (account.provider !== 'credentials') {
            await handleLoginEvent({
              userId: user.id,
              userEmail: user.email || '',
              userName: user.name ?? undefined,
              success: true,
            })
          }
        } catch (error) {
          console.error('Error creating active session:', error)
        }
      }
    },
    async signOut(message) {
      // Deaktiviere ActiveSession bei Logout
      // In NextAuth v5, the signOut event receives either { session } or { token }
      const tokenData = 'token' in message ? message.token : null
      if (tokenData?.id) {
        try {
          await prisma.activeSession.updateMany({
            where: { userId: tokenData.id as string, isActive: true },
            data: { isActive: false },
          })
          
          // Log Logout
          const user = await prisma.user.findUnique({
            where: { id: tokenData.id as string },
            select: { email: true },
          })
          
          if (user) {
            await prisma.securityLog.create({
              data: {
                userId: tokenData.id as string,
                userEmail: user.email,
                event: 'LOGOUT',
                status: 'SUCCESS',
                message: 'Benutzer hat sich abgemeldet',
              },
            })
          }
        } catch (error) {
          console.error('Error handling signOut:', error)
        }
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
})

// For backward compatibility
export const authOptions = {
  providers: [],
}
