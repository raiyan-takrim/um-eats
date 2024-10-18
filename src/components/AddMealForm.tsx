"use client"
import { KkData } from '@/app/add-meal/page';
import { addMeal } from '@/app/utilities/queries';
import Link from 'next/link';
import React, { ChangeEvent, FormEvent, useState } from 'react'

export default function AddMealForm({ kkData }: { kkData: KkData[] }) {
    console.log(kkData)

    const [kkId, setKkId] = useState<number>();
    const [quantity, setQuantity] = useState<number>(0);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!kkId || quantity <= 0) {
            setError('Please select a KK and add a valid meal quantity.');
            return;
        }

        // Redirect to home or update UI
        await addMeal(kkId, quantity)
        window.location.href = '/';
    };
    console.log(kkId)
    // console.log(kkData.find((kk) => kk.kk_id === 4)?.total_meals || 0)
    return (
        <form onSubmit={handleSubmit} className='w-[400px]'>
            <div className="mb-4">
                <label className="block mb-2 text-lg">Select Area:</label>
                <select
                    className="border border-gray-300 p-2 w-full"
                    value={kkId}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setKkId(Number(e.target.value))}
                    required
                >
                    <option value="">Select Area</option>
                    {kkData.map((kk) => (
                        <option key={kk.kk_id} value={kk.kk_id} className={`relative after:content-[${kkData.find((kk) => kk.kk_id === kkId)?.total_meals || 0}] after:absolute after:inset-0`}>
                            {kk.kk_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* {kkId && (
                <div className="mb-4 text-sm text-gray-600">
                    <p>
                        <strong>Current total meals:</strong>{' '}
                        {kkData.find((kk) => kk.kk_id === kkId)?.total_meals || 0}
                    </p>
                </div>
            )} */}

            <div className="mb-4">
                <label className="block mb-2 text-lg">Number of meals to add:</label>
                <input
                    type="number"
                    className="border border-gray-300 p-2 w-full"
                    placeholder='Meal Quantity'
                    value={quantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
                    min="1"
                    required
                />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div>
                {
                    kkId && (
                        <div className='bg-neutral p-2 rounded-sm my-4 text-accent'>
                            <span>Please Drop the meal to </span>{' '}
                            <strong>{kkData.find((kk) => kk.kk_id === kkId)?.location_name || 'N/A'}</strong>
                        </div>
                    )
                }
            </div>
            <div className="w-full flex justify-between">
                <Link href="/" className="underline text-black py-2 px-4 rounded">
                    Return to Home
                </Link>
                <button type="submit" className="bg-primary text-neutral/80 font-semibold py-2 px-10 rounded-md border-[0.2rem] border-primary hover:border-primary hover:bg-secondary hover:text-primary">
                    Add Meal
                </button>
            </div>
        </form>
    )
}
