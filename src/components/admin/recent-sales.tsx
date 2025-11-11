
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

const recentAccountsData = [
    {
        email: "user1@example.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
        email: "visitor23@domain.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 5),

    },
    {
        email: "temp-xyz@mail.tm",
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
        email: "another-one@provider.org",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        email: "last-user@web.com",
        createdAt: new Date(Date.now() - 1000 * 60 * 55),
    }
]

export default function RecentSales() {
  return (
    <div className="space-y-8">
      {recentAccountsData.map((account, index) => (
         <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${account.email}`} alt="Avatar" />
            <AvatarFallback>{account.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none truncate">{account.email}</p>
            <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(account.createdAt, { addSuffix: true })}
            </p>
            </div>
      </div>
      ))}
    </div>
  )
}
