import { Input } from "@/components/ui/input";
import check_meal from "/public/check_meal.png";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PrimaryBtn from "@/components/PrimaryBtn";
export default function page() {
    return (
        <main className="h-screen w-screen flex">
            <div className="bg-secondary w-1/2 flex place-content-center place-items-center">
                <div className="">
                    <h1 className="font-bold text-accent mb-6">Add Meal</h1>
                    <form className="w-[300px] text-accent">
                        <Select required>
                            <SelectTrigger className="bg-neutral border-primary ">
                                <SelectValue placeholder="Area" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral">
                                <SelectItem value="KK-1">KK-1</SelectItem>
                                <SelectItem value="KK-12">KK-12</SelectItem>
                                <SelectItem value="KK-13">KK-13</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Quantity" className="placeholder:text-accent bg-neutral my-6 border-primary" required />
                        <div className="flex justify-between place-items-center">
                            <Link className="h-fit text-center underline text-sm text-accent" href="/">Cancel</Link>
                            <PrimaryBtn>Add Meal</PrimaryBtn>
                        </div>
                    </form>
                </div>
            </div>
            <div className="h-full w-1/2 overlay bg-blue-50" style={{ background: `url("${check_meal.src}")`, backgroundSize: "cover" }}>
            </div>
        </main>
    )
}