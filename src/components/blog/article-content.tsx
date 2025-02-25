'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Clock, Share2, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticleBlock {
  type: string
  content?: string
  url?: string
  caption?: string
  items?: string[]
}

interface Article {
  title: string
  date: string
  readTime: string
  category: string
  author: {
    name: string
    role: string
    image: string
  }
  content: ArticleBlock[]
}

interface ArticleContentProps {
  article: Article
}

export function ArticleContent({ article }: ArticleContentProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-20">
        <div className="container py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            {/* Article Meta */}
            <div className="flex items-center gap-4 text-sm">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                {article.category}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {article.date}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </div>
            </div>

            {/* Article Title */}
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {article.title}
            </h1>

            {/* Author Info */}
            <div className="mt-8 flex items-center gap-4">
              <Image
                src={article.author.image}
                alt={article.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{article.author.name}</p>
                <p className="text-sm text-muted-foreground">{article.author.role}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Teilen:</span>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="container pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-3xl space-y-8"
        >
          {article.content.map((block, index) => {
            switch (block.type) {
              case 'paragraph':
                if (!block.content) return null
                return (
                  <p key={index} className="text-lg leading-relaxed text-muted-foreground">
                    {block.content}
                  </p>
                )
              case 'subheading':
                if (!block.content) return null
                return (
                  <h2 key={index} className="text-2xl font-bold tracking-tight">
                    {block.content}
                  </h2>
                )
              case 'image':
                if (!block.url || !block.caption) return null
                return (
                  <div key={index} className="relative aspect-[16/9] overflow-hidden rounded-xl">
                    <Image
                      src={block.url}
                      alt={block.caption}
                      fill
                      className="object-cover"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {block.caption}
                    </p>
                  </div>
                )
              case 'quote':
                if (!block.content) return null
                return (
                  <blockquote key={index} className="border-l-4 border-primary pl-6 italic">
                    {block.content}
                  </blockquote>
                )
              case 'list':
                if (!block.items) return null
                return (
                  <ul key={index} className="my-6 space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )
              default:
                return null
            }
          })}
        </motion.div>
      </section>
    </>
  )
} 