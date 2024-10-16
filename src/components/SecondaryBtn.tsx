import { Button } from './ui/button'

export default function SecondaryBtn({ children }: { children: React.ReactNode }) {
    return (
        <Button className="hover:bg-primary hover:text-neutral/80 font-semibold py-5 px-10 rounded-md border-[0.2rem] border-primary hover:border-primary bg-secondary text-primary">{children}</Button>
    )
}
