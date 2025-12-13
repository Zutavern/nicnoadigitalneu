"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: 'STYLIST' | 'SALON_OWNER';
  text: string;
  imageUrl: string | null;
  company: string | null;
}

interface TestimonialsColumnProps {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}

export const TestimonialsColumn = ({ 
  className, 
  testimonials, 
  duration = 10 
}: TestimonialsColumnProps) => {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {testimonials.map((testimonial, i) => (
                <div 
                  key={`${testimonial.id}-${index}`}
                  className="p-10 rounded-3xl border bg-card shadow-lg shadow-primary/10 max-w-xs w-full hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          'fill-yellow-400 text-yellow-400'
                        )}
                      />
                    ))}
                  </div>
                  
                  {/* Text */}
                  <div className="text-muted-foreground leading-relaxed italic mb-5">
                    "{testimonial.text}"
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {testimonial.imageUrl ? (
                      <img
                        width={40}
                        height={40}
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="font-medium tracking-tight leading-5 text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="leading-5 opacity-60 tracking-tight text-sm text-muted-foreground">
                        {testimonial.role === 'STYLIST' ? 'Stuhlmietern' : 'Salonbesitzer'}
                        {testimonial.company && ` • ${testimonial.company}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};








