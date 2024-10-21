// // "use client"; // Add this at the top to mark the component as a Client Component
// // import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// // import { sql } from '@vercel/postgres';

// // interface Kk {
// //     id: string;
// //     name: string;
// // }

// // interface Student {
// //     id: string;
// //     name: string;
// // }

// // export const dynamic = 'force-dynamic';

// // // Fetch booking data from the database on the server side
// // async function getBookingData(): Promise<{ kks: Kk[], students: Student[] }> {
// //     const kks = await sql`SELECT id, name FROM kk`;
// //     const students = await sql`SELECT id, name FROM students`;
// //     return { kks: kks.rows as Kk[], students: students.rows as Student[] };
// // }

// // // The component itself is now a Client Component
// // export default function BookMeal() {
// //     const [studentId, setStudentId] = useState<string>('');
// //     const [kkId, setKkId] = useState<string>('');
// //     const [quantity, setQuantity] = useState<number>(0);
// //     const [error, setError] = useState<string>('');
// //     const [kks, setKks] = useState<Kk[]>([]);
// //     const [students, setStudents] = useState<Student[]>([]);

// //     // Fetch data when component mounts
// //     useEffect(() => {
// //         async function fetchData() {
// //             const data = await getBookingData();
// //             setKks(data.kks);
// //             setStudents(data.students);
// //         }
// //         fetchData();
// //     }, []); // Empty dependency array means this runs once when the component mounts

// //     const handleSubmit = async (e: FormEvent) => {
// //         e.preventDefault();

// //         if (!studentId || !kkId || quantity <= 0 || quantity > 4) {
// //             setError('Please select valid fields and ensure meals are between 1 and 4.');
// //             return;
// //         }

// //         // Insert the booking into the database
// //         await sql`
// //             INSERT INTO bookings (student_id, meal_id, kk_id, quantity)
// //             VALUES (${studentId}, (SELECT id FROM meals WHERE kk_id = ${kkId} LIMIT 1), ${kkId}, ${quantity});
// //         `;

// //         window.location.href = '/';
// //     };

// //     return (
// //         <div className="container mx-auto p-8">
// //             <h1 className="text-2xl font-bold mb-6">Book a Meal</h1>

// //             <form onSubmit={handleSubmit}>
// //                 <div className="mb-4">
// //                     <label className="block mb-2 text-lg">Select Student:</label>
// //                     <select
// //                         className="border border-gray-300 p-2 w-full"
// //                         value={studentId}
// //                         onChange={(e: ChangeEvent<HTMLSelectElement>) => setStudentId(e.target.value)}
// //                         required
// //                     >
// //                         <option value="">Select Student</option>
// //                         {students.map((student) => (
// //                             <option key={student.id} value={student.id}>
// //                                 {student.name}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>

// //                 <div className="mb-4">
// //                     <label className="block mb-2 text-lg">Select KK:</label>
// //                     <select
// //                         className="border border-gray-300 p-2 w-full"
// //                         value={kkId}
// //                         onChange={(e: ChangeEvent<HTMLSelectElement>) => setKkId(e.target.value)}
// //                         required
// //                     >
// //                         <option value="">Select KK</option>
// //                         {kks.map((kk) => (
// //                             <option key={kk.id} value={kk.id}>
// //                                 {kk.name}
// //                             </option>
// //                         ))}
// //                     </select>
// //                 </div>

// //                 <div className="mb-4">
// //                     <label className="block mb-2 text-lg">Number of meals to book:</label>
// //                     <input
// //                         type="number"
// //                         className="border border-gray-300 p-2 w-full"
// //                         value={quantity}
// //                         onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
// //                         min="1"
// //                         max="4"
// //                         required
// //                     />
// //                 </div>

// //                 {error && <p className="text-red-600 mb-4">{error}</p>}

// //                 <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
// //                     Book Meal
// //                 </button>
// //             </form>
// //         </div>
// //     );
// // }


// "use client";

// import { useState, ChangeEvent, FormEvent } from "react";
// import { sql } from '@vercel/postgres';

// interface Kk {
//     id: string;
//     name: string;
//     total_meals: number;
//     location_name: string;
// }

// export const dynamic = 'force-dynamic';

// async function getKkData(): Promise<Kk[]> {
//     const kks = await sql`SELECT id, name, total_meals, location_name FROM kks`;
//     return kks.rows as Kk[];
// }

// export default async function BookMeal() {
//     const kks = await getKkData();

//     const [name, setName] = useState<string>("");
//     const [matricNumber, setMatricNumber] = useState<string>("");
//     const [siswamail, setSiswamail] = useState<string>("");
//     const [kkId, setKkId] = useState<string>("");
//     const [quantity, setQuantity] = useState<number>(0);
//     const [error, setError] = useState<string>("");

//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();

//         if (!name || !matricNumber || !siswamail || !kkId || quantity <= 0 || quantity > 4) {
//             setError("Please fill out all fields and ensure meal quantity is between 1 and 4.");
//             return;
//         }

//         // Check meal availability
//         const selectedKk = kks.find(kk => kk.id === kkId);
//         if (!selectedKk || selectedKk.total_meals < quantity) {
//             setError("Not enough meals available in this KK.");
//             return;
//         }

//         // Insert booking and update meals
//         await sql`INSERT INTO students (name, matric_number, siswamail) 
//               VALUES (${name}, ${matricNumber}, ${siswamail}) 
//               ON CONFLICT DO NOTHING`;

//         await sql`INSERT INTO bookings (student_id, kk_id, quantity)
//               VALUES ((SELECT id FROM students WHERE matric_number = ${matricNumber}), 
//                       ${kkId}, ${quantity})`;

//         await sql`UPDATE kks SET total_meals = total_meals - ${quantity} WHERE id = ${kkId}`;

//         window.location.href = '/';
//     };

//     return (
//         <div className="container mx-auto p-8">
//             <h1 className="text-2xl font-bold mb-6">Book a Meal</h1>

//             <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                     <label className="block mb-2 text-lg">Student Name:</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 p-2 w-full"
//                         value={name}
//                         onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block mb-2 text-lg">Matric Number:</label>
//                     <input
//                         type="text"
//                         className="border border-gray-300 p-2 w-full"
//                         value={matricNumber}
//                         onChange={(e: ChangeEvent<HTMLInputElement>) => setMatricNumber(e.target.value)}
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block mb-2 text-lg">Siswamail:</label>
//                     <input
//                         type="email"
//                         className="border border-gray-300 p-2 w-full"
//                         value={siswamail}
//                         onChange={(e: ChangeEvent<HTMLInputElement>) => setSiswamail(e.target.value)}
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block mb-2 text-lg">Select KK:</label>
//                     <select
//                         className="border border-gray-300 p-2 w-full"
//                         value={kkId}
//                         onChange={(e: ChangeEvent<HTMLSelectElement>) => setKkId(e.target.value)}
//                         required
//                     >
//                         <option value="">Select KK</option>
//                         {kks.map((kk) => (
//                             <option key={kk.id} value={kk.id}>
//                                 {`${kk.name} (Available: ${kk.total_meals} meals)`}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="mb-4">
//                     <label className="block mb-2 text-lg">Number of meals to book:</label>
//                     <input
//                         type="number"
//                         className="border border-gray-300 p-2 w-full"
//                         value={quantity}
//                         onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
//                         min="1"
//                         max="4"
//                         required
//                     />
//                 </div>

//                 {error && <p className="text-red-600 mb-4">{error}</p>}

//                 <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
//                     Book Meal
//                 </button>
//             </form>
//         </div>
//     );
// }

import React from 'react'

export default function page() {
    return (
        <div className='flex flex-col place-items-center place-content-center w-screen h-screen bg-neutral text-accent text-2xl font-semibold'>
            <h1>Oppps! Site is under constraction!</h1>
            <h3>Comming Soon...🎉</h3>
        </div>
    )
}
