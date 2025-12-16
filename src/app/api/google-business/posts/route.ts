import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createGoogleBusinessClient } from '@/lib/google-business/api-client'
import { MOCK_GOOGLE_BUSINESS_DATA } from '@/lib/google-business/mock-data'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      // Return mock data if not connected
      return NextResponse.json({
        posts: MOCK_GOOGLE_BUSINESS_DATA.posts,
        isDemo: true,
      })
    }

    const posts = await client.getPosts()

    return NextResponse.json({
      posts,
      isDemo: false,
    })
  } catch (error) {
    console.error('Error getting posts:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Beiträge' },
      { status: 500 }
    )
  }
}

// Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Keine Google Business Verbindung' },
        { status: 404 }
      )
    }

    const postData = await request.json()

    if (!postData.content) {
      return NextResponse.json(
        { error: 'content erforderlich' },
        { status: 400 }
      )
    }

    const postId = await client.createPost({
      type: postData.type || 'update',
      title: postData.title,
      content: postData.content,
      imageUrl: postData.imageUrl,
      ctaType: postData.ctaType,
      ctaUrl: postData.ctaUrl,
      startDate: postData.startDate,
      endDate: postData.endDate,
    })

    return NextResponse.json({ 
      success: true,
      postId,
      message: 'Beitrag erstellt'
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Beitrags' },
      { status: 500 }
    )
  }
}

// Delete a post
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const client = await createGoogleBusinessClient(session.user.id)
    
    if (!client) {
      return NextResponse.json(
        { error: 'Keine Google Business Verbindung' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'postId erforderlich' },
        { status: 400 }
      )
    }

    await client.deletePost(postId)

    return NextResponse.json({ 
      success: true,
      message: 'Beitrag gelöscht'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Beitrags' },
      { status: 500 }
    )
  }
}

