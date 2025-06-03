"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { AssetCheckout } from "@/types"
import { checkoutApi } from "@/lib/api"

const formSchema = z.object({
  notes: z.string().max(1000).optional(),
})

interface CheckoutReturnFormProps {
  checkout: AssetCheckout
  onSuccess?: () => void
}

export function CheckoutReturnForm({ checkout, onSuccess }: CheckoutReturnFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await checkoutApi.returnAsset(checkout.id, values.notes)

      toast({
        title: "Asset Returned",
        description: "The asset has been returned successfully.",
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/assets/checkouts")
        router.refresh()
      }
    } catch (error) {
      console.error("Error returning asset:", error)
      toast({
        title: "Error",
        description: "Failed to return asset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any notes about the condition or return process"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Return Asset"
          )}
        </Button>
      </form>
    </Form>
  )
}
