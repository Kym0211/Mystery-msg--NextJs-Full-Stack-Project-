"use client"

import { useParams } from "next/navigation";
import React, {useEffect, useState} from "react";import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator"

const FormSchema = z.object({
  content: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

const defualtMessages = ["What is something you've always wanted to learn but haven't had the chance to?","If you could instantly master one new skill, what would it be?","What's an experience from your past that really surprised you and left a lasting impression?"]


const Page = () => {
    const [isSending, setIsSending] = useState(false)
    const [loading, setLoading] = useState(false)
    const {username} = useParams()
    const [suggestedMessages, setSuggestedMessages] = useState<string[]>(defualtMessages)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
          content: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        setIsSending(true)
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                username: username,
                content: data.content
            })
            console.log("response from sendMessages :-", response)
            toast({
                title: response.data.message,
                variant: "default"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to send message",
                variant: "destructive"
            })
        } finally {
            setIsSending(false)
        }
    }

    const copyToTextbox = (message: string) => {
        form.setValue("content", message)
    }

    const fetchSuggestMessages = async () => {
        setLoading(true)
        try {
            const response = await axios.post<ApiResponse>('/api/suggest-messages')
            console.log("response from suggestMessages :-", response.data)

            // filtering out the questions from response.data
            const questionsArray = (response.data as unknown as string).split(/\d+\.\s*/).filter(Boolean).map(question => question.trim()).slice(1,4);
            console.log("questionsArray :-", questionsArray)
            setSuggestedMessages(questionsArray)

        } catch (error) {
            console.log("error from suggestMessages :-", error)
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch messages",
                variant: "destructive"
            })
            
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
        <header className="container self-center mt-5">
            <h1 className="font-bold text-3xl text-center">Public Profile Link</h1>
        </header>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 m-5 flex justify-center flex-col ">
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Send message to {username}</FormLabel>
                    <FormControl>
                        <Input placeholder="Write your message here" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                {/* <Button type="submit" className="mx-auto ">Submit</Button> */}
                <Button type="submit" aria-disabled={loading} className="mx-auto" >
                {
                    isSending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                    </>
                    ) : ("Send")
                }
                </Button>
            </form>
        </Form>
        <section className="m-5">
            <div className="space-x-4">
                <Button className="mb-2" type="submit" onClick={() => fetchSuggestMessages()} aria-disabled={loading} >
                    {
                        loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                        </>
                        ) : ("Suggest Messages")
                    }
                </Button>

                <Separator orientation="horizontal" className="my-4 w-1/2"/>
            </div>
            <div>
                <div className="flex flex-col space-y-4">
                    {
                        suggestedMessages.map((message, index) => (
                            <div key={index} className="bg-gray-100 p-4 rounded-lg cursor-pointer" onClick={() => copyToTextbox(message)}>
                                <p>{message}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
        </>
    );
}

export default Page;