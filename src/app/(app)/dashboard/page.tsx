"use client"

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/models/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-separator";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Dashboard = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)
    const [profileUrl, setProfileUrl] = useState<string>("")

    const {toast} = useToast()

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter(message => message._id !== messageId))
    }

    const {data: session} = useSession()
    const form = useForm({
        resolver: zodResolver(acceptMessageSchema),
    })
    // console.log("form from dashboard :-", form)
    const {register, watch, setValue} = form

    const acceptMessages = watch("acceptMessages")

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>(`/api/accept-messages`)
            setValue('acceptMessages', response.data.isAcceptingMessage)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message settings",
                variant: "destructive"
            })
        } finally {
            setIsSwitchLoading(false)
        }
    },[setValue])

    const fetchMessages = useCallback( async (refresh: boolean = false) => {
        setIsSwitchLoading(false)
        setLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            
            setMessages(response.data.messages || [])
            if(refresh){
                toast({
                    title: "Refreshed Messages",
                    description: "Messages refreshed",
                    variant: "default"
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message settings",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setLoading, setMessages])

    useEffect(() => {
        if(!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    },[session, setValue, fetchAcceptMessage, fetchMessages])

    // handle switch change
    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {acceptMessages: !acceptMessages})

            setValue('acceptMessages', !acceptMessages)
            toast({
                title: response.data.message,
                variant: "default"
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: "Error",
                description: axiosError.response?.data.message || "Failed to fetch message settings",
                variant: "destructive"
            })
        }
    }

    const username = session?.user ? (session.user as User).username : null;
    
    useEffect(() => {
        const profileUrl = `${window.location.origin}/u/${username}`
        setProfileUrl(profileUrl)
    })

    const copyToClipboard = async () => {
        navigator.clipboard.writeText(profileUrl)
        console.log("profile url copied to clipboard")
        try {
            toast({
                title: "Url Copied",
                description: "Profile url copied to clipboard",
                variant: "default"
            })
        } catch (error) {
            console.log("Error copying url to clipboard", error)
            
        }
    }

    if(!session || !session.user){
        return (
            <div>
                <h1>Unauthorized, Please login</h1>
            </div>
        )
    }

    const sendMessages = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                username: username,
                content: "Hello, I am sending you a message from the dashboard"
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
        }
    }
    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded max-w-6xl">
            <h1 className="text-4xl font-bold mb-6">User Dashboard</h1>
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
                <div className="flex items-center">
                    <input 
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>
            <div className="mb-4">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
            </div>
            <Separator />

            <Button 
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <RefreshCcw className="w-4 h-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={message._id as string}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages found</p>
                )}
            </div>
        </div>
    );

}

export default Dashboard;