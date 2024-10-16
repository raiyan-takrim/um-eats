import { Button } from "./ui/button";

export default function PrimaryBtn({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <Button className={`" bg-primary text-neutral/80 font-semibold py-5 px-10 rounded-md border-[0.2rem] border-primary hover:border-primary hover:bg-secondary hover:text-primary ${className}"`}>{children}</Button>
    )
}
