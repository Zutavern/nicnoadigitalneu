'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Share2,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Globe,
  Repeat2,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PostPreviewProps {
  content: string
  hashtags: string[]
  mediaUrls: string[]
  platforms: string[]
  userName?: string
  userAvatar?: string
  userHandle?: string
  className?: string
}

const PLATFORM_ICONS = {
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  LINKEDIN: Linkedin,
  TWITTER: Twitter,
  TIKTOK: Share2,
  YOUTUBE: Youtube,
}

const PLATFORM_COLORS = {
  INSTAGRAM: 'from-purple-500 to-pink-500',
  FACEBOOK: 'from-blue-600 to-blue-500',
  LINKEDIN: 'from-blue-700 to-blue-600',
  TWITTER: 'from-gray-800 to-black',
  TIKTOK: 'from-pink-500 to-cyan-500',
  YOUTUBE: 'from-red-600 to-red-500',
}

export function PostPreview({
  content,
  hashtags,
  mediaUrls,
  platforms,
  userName = 'Mein Salon',
  userAvatar,
  userHandle = '@meinsalon',
  className,
}: PostPreviewProps) {
  const [activePreview, setActivePreview] = useState(platforms[0] || 'INSTAGRAM')
  
  const fullContent = hashtags.length > 0
    ? `${content}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
    : content
  
  // Plattform-spezifische Kürzung
  const getDisplayContent = (platform: string) => {
    const maxLengths: Record<string, number> = {
      INSTAGRAM: 2200,
      FACEBOOK: 500, // Vorschau kürzer
      LINKEDIN: 700,
      TWITTER: 280,
      TIKTOK: 150,
      YOUTUBE: 500,
    }
    
    const max = maxLengths[platform] || 500
    if (fullContent.length <= max) return fullContent
    return fullContent.slice(0, max - 3) + '...'
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Vorschau</CardTitle>
        
        {/* Platform Tabs */}
        <Tabs value={activePreview} onValueChange={setActivePreview}>
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${platforms.length}, 1fr)` }}>
            {platforms.map(p => {
              const Icon = PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS] || Share2
              return (
                <TabsTrigger key={p} value={p} className="gap-1 text-xs">
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{p === 'TWITTER' ? 'X' : p.charAt(0) + p.slice(1).toLowerCase()}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePreview}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activePreview === 'INSTAGRAM' && (
              <InstagramPreview
                content={getDisplayContent('INSTAGRAM')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
              />
            )}
            
            {activePreview === 'FACEBOOK' && (
              <FacebookPreview
                content={getDisplayContent('FACEBOOK')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
              />
            )}
            
            {activePreview === 'LINKEDIN' && (
              <LinkedInPreview
                content={getDisplayContent('LINKEDIN')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
              />
            )}
            
            {activePreview === 'TWITTER' && (
              <TwitterPreview
                content={getDisplayContent('TWITTER')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
                userHandle={userHandle}
              />
            )}
            
            {activePreview === 'TIKTOK' && (
              <TikTokPreview
                content={getDisplayContent('TIKTOK')}
                mediaUrls={mediaUrls}
                userName={userName}
              />
            )}
            
            {activePreview === 'YOUTUBE' && (
              <YouTubePreview
                content={getDisplayContent('YOUTUBE')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// Instagram Preview
function InstagramPreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-black border-t">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm">{userName.toLowerCase().replace(/\s/g, '_')}</span>
        <MoreHorizontal className="h-5 w-5 ml-auto" />
      </div>
      
      {/* Media */}
      {mediaUrls.length > 0 ? (
        <div className="aspect-square relative bg-muted">
          <Image
            src={mediaUrls[0]}
            alt="Post"
            fill
            className="object-cover"
          />
          {mediaUrls.length > 1 && (
            <Badge className="absolute top-2 right-2 bg-black/70 text-white">
              1/{mediaUrls.length}
            </Badge>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Instagram className="h-12 w-12 text-muted-foreground/50" />
        </div>
      )}
      
      {/* Actions */}
      <div className="p-3 flex items-center gap-4">
        <Heart className="h-6 w-6" />
        <MessageCircle className="h-6 w-6" />
        <Send className="h-6 w-6" />
        <Bookmark className="h-6 w-6 ml-auto" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm">
          <span className="font-semibold mr-1">{userName.toLowerCase().replace(/\s/g, '_')}</span>
          <span className="whitespace-pre-wrap">{content}</span>
        </p>
      </div>
    </div>
  )
}

// Facebook Preview
function FacebookPreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border-t">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{userName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            Gerade eben · <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      
      {/* Media */}
      {mediaUrls.length > 0 && (
        <div className="aspect-[1.91/1] relative bg-muted">
          <Image
            src={mediaUrls[0]}
            alt="Post"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="p-3 border-t flex items-center justify-around">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-4 py-2 rounded">
          <ThumbsUp className="h-5 w-5" /> Gefällt mir
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-4 py-2 rounded">
          <MessageCircle className="h-5 w-5" /> Kommentieren
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-4 py-2 rounded">
          <Share2 className="h-5 w-5" /> Teilen
        </button>
      </div>
    </div>
  )
}

// LinkedIn Preview
function LinkedInPreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border-t">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-12 w-12 rounded">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{userName}</div>
          <div className="text-xs text-muted-foreground">Friseur & Beauty Experte</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            Jetzt · <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      
      {/* Media */}
      {mediaUrls.length > 0 && (
        <div className="aspect-[1.91/1] relative bg-muted">
          <Image
            src={mediaUrls[0]}
            alt="Post"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Reactions */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t">
        👍 💙 12 · 3 Kommentare
      </div>
      
      {/* Actions */}
      <div className="px-3 py-2 border-t flex items-center justify-around">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-3 py-2 rounded">
          <ThumbsUp className="h-4 w-4" /> Gefällt mir
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-3 py-2 rounded">
          <MessageCircle className="h-4 w-4" /> Kommentar
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-3 py-2 rounded">
          <Repeat2 className="h-4 w-4" /> Reposten
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-muted px-3 py-2 rounded">
          <Send className="h-4 w-4" /> Senden
        </button>
      </div>
    </div>
  )
}

// Twitter/X Preview
function TwitterPreview({ content, mediaUrls, userName, userAvatar, userHandle }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
  userHandle: string
}) {
  const isOverLimit = content.length > 280
  
  return (
    <div className="bg-white dark:bg-black border-t p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm truncate">{userName}</span>
            <span className="text-muted-foreground text-sm truncate">{userHandle}</span>
            <span className="text-muted-foreground text-sm">· Jetzt</span>
          </div>
          
          {/* Content */}
          <p className={cn(
            "text-sm whitespace-pre-wrap mt-1",
            isOverLimit && "text-red-500"
          )}>
            {content}
          </p>
          
          {isOverLimit && (
            <Badge variant="destructive" className="mt-2">
              {content.length}/280 - Zu lang!
            </Badge>
          )}
          
          {/* Media */}
          {mediaUrls.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border">
              <div className="aspect-[16/9] relative bg-muted">
                <Image
                  src={mediaUrls[0]}
                  alt="Post"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-[400px]">
            <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-green-500">
              <Repeat2 className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-pink-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500">
              <Eye className="h-4 w-4" />
              <span className="text-xs">0</span>
            </button>
            <button className="text-muted-foreground hover:text-blue-500">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// TikTok Preview  
function TikTokPreview({ content, mediaUrls, userName }: {
  content: string
  mediaUrls: string[]
  userName: string
}) {
  return (
    <div className="bg-black text-white border-t aspect-[9/16] max-h-[400px] relative overflow-hidden">
      {/* Background */}
      {mediaUrls.length > 0 ? (
        <Image
          src={mediaUrls[0]}
          alt="Post"
          fill
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/50 to-cyan-500/50" />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-12 p-4">
        <div className="font-semibold text-sm">@{userName.toLowerCase().replace(/\s/g, '_')}</div>
        <p className="text-sm mt-1 line-clamp-3">{content}</p>
      </div>
      
      {/* Side Actions */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
        <button className="flex flex-col items-center">
          <Heart className="h-7 w-7" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex flex-col items-center">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex flex-col items-center">
          <Bookmark className="h-7 w-7" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex flex-col items-center">
          <Share2 className="h-7 w-7" />
          <span className="text-xs">0</span>
        </button>
      </div>
    </div>
  )
}

// YouTube Preview
function YouTubePreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border-t">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-sm">{userName}</div>
          <div className="text-xs text-muted-foreground">Community Post · Gerade eben</div>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      
      {/* Media */}
      {mediaUrls.length > 0 && (
        <div className="aspect-video relative bg-muted mx-3 rounded-lg overflow-hidden">
          <Image
            src={mediaUrls[0]}
            alt="Post"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Actions */}
      <div className="p-3 flex items-center gap-4">
        <button className="flex items-center gap-1 text-muted-foreground">
          <ThumbsUp className="h-5 w-5" />
          <span className="text-sm">0</span>
        </button>
        <button className="flex items-center gap-1 text-muted-foreground">
          <ThumbsUp className="h-5 w-5 rotate-180" />
        </button>
        <button className="flex items-center gap-1 text-muted-foreground">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">0</span>
        </button>
      </div>
    </div>
  )
}

export default PostPreview

