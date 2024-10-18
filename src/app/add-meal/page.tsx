import AddMealForm from '@/components/AddMealForm';
// import { Input } from "@/components/ui/input";
import add_meal from "/public/add_meal.png";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"

// import Link from "next/link";
// import PrimaryBtn from "@/components/PrimaryBtn";
// export default function page() {
//     return (
//         <main className="h-screen w-screen flex">
//             {/* <div className="bg-secondary w-1/2 flex place-content-center place-items-center">
//                 <div className="">
//                     <h1 className="font-bold text-accent mb-6">Add Meal</h1>
//                     <form className="w-[300px] text-accent">
//                         <Select required>
//                             <SelectTrigger className="bg-neutral border-primary ">
//                                 <SelectValue placeholder="Area" />
//                             </SelectTrigger>
//                             <SelectContent className="bg-neutral">
//                                 <SelectItem value="KK-1">KK-1</SelectItem>
//                                 <SelectItem value="KK-12">KK-12</SelectItem>
//                                 <SelectItem value="KK-13">KK-13</SelectItem>
//                             </SelectContent>
//                         </Select>
//                         <Input placeholder="Quantity" className="placeholder:text-accent bg-neutral my-6 border-primary" required />
//                         <div className="flex justify-between place-items-center">
//                             <Link className="h-fit text-center underline text-sm text-accent" href="/">Cancel</Link>
//                             <PrimaryBtn>Add Meal</PrimaryBtn>
//                         </div>
//                     </form>
//                 </div>
//             </div> */}


//             <div className="h-full w-1/2 overlay bg-blue-50" style={{ background: `url("${add_meal.src}")`, backgroundRepeat: "no-repeat", backgroundPosition: "center" }}>
//             </div>
//         </main>
//     )
// }


// app/add-meal/page.tsx
import { sql } from '@vercel/postgres';

export interface KkData {
    kk_id: number;
    kk_name: string;
    total_meals: number;
    location_name: string;
}

export const dynamic = 'force-dynamic';

async function getKkData(): Promise<KkData[]> {
    const result = await sql`
    SELECT kk.id AS kk_id, kk.name AS kk_name, SUM(meals.quantity) AS total_meals, ml.location_name
    FROM kk
    LEFT JOIN meals ON kk.id = meals.kk_id
    LEFT JOIN meal_locations ml ON ml.kk_id = kk.id
    GROUP BY kk.id, kk.name, ml.location_name;
  `;
    return result.rows as KkData[];
}

export default async function AddMeal() {
    const kkData = await getKkData();
    return (
        <main className="h-screen w-screen flex">
            <div className="bg-secondary w-1/2 flex flex-col place-content-center place-items-center">
                <h1 className="text-2xl font-bold mb-6">Add Meals to KK</h1>
                <AddMealForm kkData={kkData} />
            </div>
            <div className="h-full w-1/2 overlay bg-blue-50" style={{ background: `url("${add_meal.src}")`, backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></div>
        </main>
    );
}
