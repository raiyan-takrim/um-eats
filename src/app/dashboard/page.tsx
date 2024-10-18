import { sql } from "@vercel/postgres";
import Link from "next/link";

// app/dashboard/page.js
export const dynamic = 'force-dynamic'; // ensures SSR

// Fetching meal data directly from PostgreSQL
async function getMealsData() {
    const result = await sql`
    SELECT kk.name AS kk_name, SUM(meals.quantity) AS total_meals
    FROM meals
    JOIN kk ON meals.kk_id = kk.id
    GROUP BY kk.name
    ORDER BY kk.name;
    `
    return result.rows;
}

export default async function Dashboard() {
    // Fetch meal data
    const mealData = await getMealsData();

    return (
        <div className="container mx-auto p-8 bg-neutral text-accent h-screen w-screen">
            <h1 className="text-2xl font-bold mb-6">Meal Availability Dashboard</h1>
            <table className="table-auto w-full border-collapseS">
                <thead>
                    <tr className="bg-primary text-neutral">
                        <th className="py-2 px-6">KK Name</th>
                        <th className="py-2 px-6">Total Meals Available</th>
                    </tr>
                </thead>
                <tbody className="font-medium">
                    {mealData.length > 0 ? (
                        mealData.map((meal, index) => (
                            <tr key={meal.kk_name} className={index % 2 === 0 ? 'bg-secondary' : 'bg-secondary/45'}>
                                <td className="py-2 px-6 text-center">{meal.kk_name}</td>
                                <td className="py-2 px-6 text-center">{meal.total_meals}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="py-2 px-6 bg-secondary" colSpan={2}>
                                No meal data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-around w-full place-items-center">
                <Link className="text-center underline text-sm text-accent inline-block" href="/">Back to Home</Link>
                <Link href={"/book_meal"} className="bg-primary text-neutral font-semibold py-2 px-7 rounded-md border-[0.2rem] border-primary hover:border-primary hover:bg-neutral hover:text-primary transition duration-300 text-sm text-center inline-block my-6">Book Meal</Link>
            </div>
        </div>
    );
}
