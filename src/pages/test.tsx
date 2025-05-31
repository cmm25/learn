import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function CardDemo() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Test Card</CardTitle>
                <CardDescription>
                    This is a test card component
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Card content goes here</p>
            </CardContent>
        </Card>
    )
}
