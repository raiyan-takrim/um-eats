"use server"
import { sql } from "@vercel/postgres";

export async function addMeal(kkId: number, quantity: number) {
    await sql`
    INSERT INTO meals (kk_id, quantity, location_id)
    VALUES (${kkId}, ${quantity}, (SELECT id FROM meal_locations WHERE kk_id = ${kkId}));
  `;
}

export async function getSubtotalMeals() {
    const { rows } = await sql`SELECT SUM(quantity) AS total_meals
FROM meals
`
    return Number(rows[0].total_meals);
}

// type booking = {
//     name: string
//     matricNumber:

// }
// export async function InsertBooking(params:booking) {
//     await sql`INSERT INTO students (name, matric_number, siswamail)
//               VALUES (${name}, ${matricNumber}, ${siswamail})
//               ON CONFLICT DO NOTHING`;

//     await sql`INSERT INTO bookings (student_id, kk_id, quantity)
//               VALUES ((SELECT id FROM students WHERE matric_number = ${matricNumber}),
//                       ${kkId}, ${quantity})`;

//     await sql`UPDATE kks SET total_meals = total_meals - ${quantity} WHERE id = ${kkId}`;
// }