import PrimaryBtn from "@/components/PrimaryBtn";
import check_meal from "/public/check_meal.png";
import Link from "next/link";
export default function page() {
    return (
        <main className="h-screen w-screen flex">
            <div className="h-full w-1/2 overlay bg-blue-50" style={{ background: `url("${check_meal.src}")`, backgroundSize: "cover" }}>
            </div>
            <div className="bg-secondary w-1/2 flex place-content-center place-items-center">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold text-accent">Let&apos;s Check Availability</h1>
                    <Link href={"/dashboard"} className="bg-primary text-neutral/80 font-semibold py-2 px-7 rounded-md border-[0.2rem] border-primary hover:border-primary hover:bg-secondary hover:text-primary transition duration-300 text-sm text-center inline-block mx-auto my-6">Check</Link>
                    <Link className="text-center underline text-sm text-accent" href="/">Back to Home</Link>
                </div>
            </div>
        </main>
    )
}
