"use client"
import { Card, CardContent, CardHeader} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import messages from "@/messages.json"

export default function Home() {
  return (
    <>
    <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">Message annonymously</h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
          Send and receive messages without revealing your identity. Stay connected while keeping your privacy intact.
          </p>
      </section>
      <Carousel plugins={[Autoplay({delay: 2000})]} className="w-full max-w-xs">
        <CarouselContent>
          {messages.map((message, index) => (
            <CarouselItem key={index}>
              <Card>
                <CardHeader>
                  {message.title}
                </CardHeader>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-lg font-semibold">{message.content}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </main>
    <footer className="text-center p-4 md:p-6">© 2023 Mystery Message</footer>
    </>
  )
}
