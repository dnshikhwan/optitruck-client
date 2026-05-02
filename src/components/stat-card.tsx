import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ size?: number }>;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
}: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <CardDescription className="uppercase text-xs tracking-widest">
                        {title}
                    </CardDescription>
                    <Icon size={24} />
                </div>
                <CardTitle className="text-3xl font-bold">{value}</CardTitle>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
