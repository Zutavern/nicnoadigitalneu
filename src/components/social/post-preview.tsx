'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Music2,
  Home,
  Search,
  User,
  Play,
  ChevronLeft,
  ChevronRight,
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const fullContent = hashtags.length > 0
    ? `${content}\n\n${hashtags.map(h => `#${h}`).join(' ')}`
    : content
  
  // Plattform-spezifische Kürzung
  const getDisplayContent = (platform: string) => {
    const maxLengths: Record<string, number> = {
      INSTAGRAM: 2200,
      FACEBOOK: 500,
      LINKEDIN: 700,
      TWITTER: 280,
      TIKTOK: 150,
      YOUTUBE: 500,
    }
    
    const max = maxLengths[platform] || 500
    if (fullContent.length <= max) return fullContent
    return fullContent.slice(0, max - 3) + '...'
  }
  
  const nextImage = () => {
    if (mediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length)
    }
  }
  
  const prevImage = () => {
    if (mediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length)
    }
  }
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live-Vorschau
        </CardTitle>
        
        {/* Platform Tabs */}
        <Tabs value={activePreview} onValueChange={(v) => { setActivePreview(v); setCurrentImageIndex(0) }}>
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${platforms.length}, 1fr)` }}>
            {platforms.map(p => {
              const Icon = PLATFORM_ICONS[p as keyof typeof PLATFORM_ICONS] || Share2
              return (
                <TabsTrigger key={p} value={p} className="gap-1 text-xs">
                  <Icon className="h-3 w-3" />
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activePreview === 'INSTAGRAM' && (
              <InstagramPreview
                content={getDisplayContent('INSTAGRAM')}
                mediaUrls={mediaUrls}
                userName={userName}
                userAvatar={userAvatar}
                currentImageIndex={currentImageIndex}
                onNextImage={nextImage}
                onPrevImage={prevImage}
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

// Instagram Preview - Realistic Feed Post
function InstagramPreview({ content, mediaUrls, userName, userAvatar, currentImageIndex, onNextImage, onPrevImage }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
  currentImageIndex: number
  onNextImage: () => void
  onPrevImage: () => void
}) {
  const handleName = userName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  
  return (
    <div className="bg-white dark:bg-black">
      {/* Instagram Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-pink-500 ring-offset-2 ring-offset-white dark:ring-offset-black">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div className="font-semibold text-sm">{handleName}</div>
            <div className="text-xs text-muted-foreground">Original audio</div>
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5" />
      </div>
      
      {/* Media - Instagram Feed: 1:1 aspect ratio */}
      <div className="relative bg-zinc-100 dark:bg-zinc-900">
        {mediaUrls.length > 0 ? (
          <>
            <div className="aspect-square relative overflow-hidden">
              <Image
                src={mediaUrls[currentImageIndex]}
                alt="Post"
                fill
                className="object-contain bg-black"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            
            {/* Image Navigation */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={onPrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-1 shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={onNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 rounded-full p-1 shadow-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {mediaUrls.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors",
                        i === currentImageIndex ? "bg-blue-500" : "bg-white/60"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Instagram className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-3 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heart className="h-6 w-6 hover:text-red-500 cursor-pointer transition-colors" />
          <MessageCircle className="h-6 w-6 hover:text-zinc-500 cursor-pointer" />
          <Send className="h-6 w-6 hover:text-zinc-500 cursor-pointer -rotate-45" />
        </div>
        <Bookmark className="h-6 w-6 hover:text-zinc-500 cursor-pointer" />
      </div>
      
      {/* Likes */}
      <div className="px-3 pt-2">
        <div className="font-semibold text-sm">1.234 Gefällt mir</div>
      </div>
      
      {/* Caption */}
      <div className="px-3 pt-1 pb-3">
        <p className="text-sm">
          <span className="font-semibold mr-1">{handleName}</span>
          <span className="whitespace-pre-wrap break-words">{content}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Alle 12 Kommentare ansehen</p>
        <p className="text-[10px] text-muted-foreground uppercase mt-1">vor 2 stunden</p>
      </div>
      
      {/* Bottom Nav */}
      <div className="flex items-center justify-around py-2 border-t border-zinc-200 dark:border-zinc-800">
        <Home className="h-6 w-6" />
        <Search className="h-6 w-6" />
        <div className="w-6 h-6 border-2 rounded" />
        <Heart className="h-6 w-6" />
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

// Facebook Preview - Realistic News Feed
function FacebookPreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-blue-600 text-white">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{userName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            Gerade eben · <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
      
      {/* Media - Facebook: 1.91:1 aspect ratio für Link Preview, 4:5 für Fotos */}
      {mediaUrls.length > 0 && (
        <div className="relative bg-zinc-100 dark:bg-zinc-800">
          <div className="aspect-[4/5] max-h-[400px] relative overflow-hidden">
            <Image
              src={mediaUrls[0]}
              alt="Post"
              fill
              className="object-contain bg-black"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          {mediaUrls.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{mediaUrls.length - 1}
            </div>
          )}
        </div>
      )}
      
      {/* Reactions Bar */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">❤️</span>
          </div>
          <span>42</span>
        </div>
        <div>8 Kommentare · 3 Mal geteilt</div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-around py-1">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg flex-1 justify-center">
          <ThumbsUp className="h-5 w-5" />
          <span className="hidden sm:inline">Gefällt mir</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg flex-1 justify-center">
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Kommentar</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg flex-1 justify-center">
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Teilen</span>
        </button>
      </div>
    </div>
  )
}

// LinkedIn Preview - Professional Feed
function LinkedInPreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const shouldTruncate = content.length > 200
  const displayContent = shouldTruncate && !expanded ? content.slice(0, 200) + '...' : content
  
  return (
    <div className="bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-blue-700 text-white">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm hover:text-blue-600 hover:underline cursor-pointer">{userName}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">Friseur & Beauty Experte • 500+ Follower</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            Jetzt • <Globe className="h-3 w-3" />
          </div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
        {shouldTruncate && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
          >
            ...mehr anzeigen
          </button>
        )}
      </div>
      
      {/* Media - LinkedIn: 1.91:1 oder 1:1 */}
      {mediaUrls.length > 0 && (
        <div className="relative bg-zinc-100 dark:bg-zinc-800">
          <div className="aspect-[1.91/1] relative overflow-hidden">
            <Image
              src={mediaUrls[0]}
              alt="Post"
              fill
              className="object-contain bg-black"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
      )}
      
      {/* Reactions */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="text-sm">👍</span>
            <span className="text-sm">💡</span>
            <span className="text-sm">❤️</span>
          </div>
          <span className="hover:text-blue-600 hover:underline cursor-pointer">128</span>
        </div>
        <div className="flex gap-2">
          <span className="hover:text-blue-600 hover:underline cursor-pointer">24 Kommentare</span>
          <span>•</span>
          <span className="hover:text-blue-600 hover:underline cursor-pointer">5 Reposts</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-around py-1 border-b border-zinc-200 dark:border-zinc-700">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded flex-1 justify-center">
          <ThumbsUp className="h-4 w-4" />
          <span>Gefällt mir</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded flex-1 justify-center">
          <MessageCircle className="h-4 w-4" />
          <span>Kommentar</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded flex-1 justify-center">
          <Repeat2 className="h-4 w-4" />
          <span>Repost</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-2 rounded flex-1 justify-center">
          <Send className="h-4 w-4" />
          <span>Senden</span>
        </button>
      </div>
    </div>
  )
}

// Twitter/X Preview - Tweet Style
function TwitterPreview({ content, mediaUrls, userName, userAvatar, userHandle }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
  userHandle: string
}) {
  const isOverLimit = content.length > 280
  const charCount = content.replace(/\s+/g, ' ').length
  
  return (
    <div className="bg-white dark:bg-black p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-zinc-800 text-white">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-sm truncate max-w-[120px]">{userName}</span>
            <span className="text-muted-foreground text-sm truncate">{userHandle}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">Jetzt</span>
            <MoreHorizontal className="h-4 w-4 ml-auto text-muted-foreground" />
          </div>
          
          {/* Content */}
          <div className="mt-1">
            <p className={cn(
              "text-[15px] whitespace-pre-wrap break-words leading-5",
              isOverLimit && "text-red-500"
            )}>
              {content}
            </p>
            
            {/* Character Counter */}
            <div className="mt-1 flex items-center gap-2">
              {isOverLimit && (
                <Badge variant="destructive" className="text-xs">
                  {charCount}/280 - Zu lang!
                </Badge>
              )}
              {!isOverLimit && charCount > 250 && (
                <span className={cn(
                  "text-xs",
                  charCount > 270 ? "text-orange-500" : "text-muted-foreground"
                )}>
                  {280 - charCount} verbleibend
                </span>
              )}
            </div>
          </div>
          
          {/* Media - Twitter: 16:9 oder 2:1 für single, Grid für multiple */}
          {mediaUrls.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {mediaUrls.length === 1 ? (
                <div className="aspect-[16/9] relative bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={mediaUrls[0]}
                    alt="Post"
                    fill
                    className="object-contain bg-black"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-0.5">
                  {mediaUrls.slice(0, 4).map((url, i) => (
                    <div key={i} className="aspect-square relative bg-zinc-100 dark:bg-zinc-900">
                      <Image
                        src={url}
                        alt={`Media ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      {i === 3 && mediaUrls.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">+{mediaUrls.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-[400px] text-muted-foreground">
            <button className="flex items-center gap-1.5 hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <span className="text-xs">12</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-green-500 group">
              <div className="p-2 rounded-full group-hover:bg-green-500/10">
                <Repeat2 className="h-[18px] w-[18px]" />
              </div>
              <span className="text-xs">5</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-pink-500 group">
              <div className="p-2 rounded-full group-hover:bg-pink-500/10">
                <Heart className="h-[18px] w-[18px]" />
              </div>
              <span className="text-xs">48</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                <Eye className="h-[18px] w-[18px]" />
              </div>
              <span className="text-xs">1.2K</span>
            </button>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                <Bookmark className="h-[18px] w-[18px]" />
              </button>
              <button className="p-2 rounded-full hover:bg-blue-500/10 hover:text-blue-500">
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// TikTok Preview - Full Screen Vertical Video Style
function TikTokPreview({ content, mediaUrls, userName }: {
  content: string
  mediaUrls: string[]
  userName: string
}) {
  const handleName = userName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  
  return (
    <div className="bg-black text-white relative overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
      {/* Background Media */}
      {mediaUrls.length > 0 ? (
        <Image
          src={mediaUrls[0]}
          alt="Post"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-500" />
      )}
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      
      {/* Play Button Indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="h-8 w-8 text-white fill-white ml-1" />
        </div>
      </div>
      
      {/* Side Actions */}
      <div className="absolute right-2 bottom-28 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-11 w-11 ring-2 ring-white">
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-cyan-500 text-white">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="w-5 h-5 rounded-full bg-pink-500 -mt-2.5 flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
        </div>
        
        <button className="flex flex-col items-center gap-1">
          <Heart className="h-7 w-7" />
          <span className="text-xs font-semibold">12.5K</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs font-semibold">328</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="h-7 w-7" />
          <span className="text-xs font-semibold">1.2K</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Share2 className="h-7 w-7" />
          <span className="text-xs font-semibold">892</span>
        </button>
        
        {/* Spinning Disc */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 border-4 border-zinc-700 animate-spin-slow flex items-center justify-center mt-2">
          <Music2 className="h-4 w-4" />
        </div>
      </div>
      
      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-14 p-3">
        <div className="font-bold text-sm mb-1">@{handleName}</div>
        <p className="text-sm line-clamp-2 leading-5">{content}</p>
        
        {/* Sound */}
        <div className="flex items-center gap-2 mt-2">
          <Music2 className="h-3 w-3" />
          <div className="overflow-hidden">
            <p className="text-xs whitespace-nowrap animate-marquee">
              Original sound - {handleName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-2 bg-black/80 backdrop-blur-sm">
        <button className="flex flex-col items-center">
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Start</span>
        </button>
        <button className="flex flex-col items-center">
          <Search className="h-5 w-5 text-zinc-500" />
          <span className="text-[10px] mt-0.5 text-zinc-500">Entdecken</span>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-10 h-7 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-lg">+</span>
          </div>
        </button>
        <button className="flex flex-col items-center">
          <MessageCircle className="h-5 w-5 text-zinc-500" />
          <span className="text-[10px] mt-0.5 text-zinc-500">Postfach</span>
        </button>
        <button className="flex flex-col items-center">
          <User className="h-5 w-5 text-zinc-500" />
          <span className="text-[10px] mt-0.5 text-zinc-500">Profil</span>
        </button>
      </div>
    </div>
  )
}

// YouTube Preview - Community Post Style
function YouTubePreview({ content, mediaUrls, userName, userAvatar }: {
  content: string
  mediaUrls: string[]
  userName: string
  userAvatar?: string
}) {
  return (
    <div className="bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="bg-red-600 text-white">{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{userName}</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0">
              Mitglied
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">Gerade eben</div>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-3">
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
      
      {/* Media - YouTube Community: 16:9 oder 1:1 */}
      {mediaUrls.length > 0 && (
        <div className="px-3 pb-3">
          <div className="rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <div className="aspect-video relative">
              <Image
                src={mediaUrls[0]}
                alt="Post"
                fill
                className="object-contain bg-black"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="px-3 pb-3 flex items-center gap-1">
        <button className="flex items-center gap-1.5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full">
          <ThumbsUp className="h-5 w-5" />
          <span className="text-sm">256</span>
        </button>
        <button className="flex items-center text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full">
          <ThumbsUp className="h-5 w-5 rotate-180" />
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full">
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">42</span>
        </button>
        <button className="ml-auto text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-full">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default PostPreview
