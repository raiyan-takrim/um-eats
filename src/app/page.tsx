import { Button } from "@/components/ui/button";
import hero_bg from "/public/hero_bg.png";
import bowl_Icon from "/public/food_bowl.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PrimaryBtn from "@/components/PrimaryBtn";
import SecondaryBtn from "@/components/SecondaryBtn";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex place-content-center place-items-center h-screen w-screen overlay" style={{ backgroundImage: `url("${hero_bg.src}")`, backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", backgroundPosition: "center" }}>
      <Card className="bg-secondary h-fit max-w-[600px] p-6 rounded-md border-none">
        <CardHeader>
          <CardTitle className="text-accent">Welcome to UMEats</CardTitle>
        </CardHeader>
        <CardContent className="text-accent/80">
          <p>Collect your free meal now. On our trip through the Philippines we were invited into a local home,  up in the mountains of Mabalacat. There we were treated to a traditional meal where you only eat with your hand.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex justify-between">
            <div>
              <Image src={bowl_Icon} height="60" width="60" alt="Food Bowl Icon"></Image>
            </div>
            <div>
              <p className="text-neutral text-sm">Available Meals</p>
              <h2 className="text-neutral font-bold text-3xl">100</h2>
            </div>
          </div>
          <Link href={"/add-meal"} className="hover:bg-primary hover:text-neutral/80 font-semibold py-2 px-7 rounded-md border-[0.2rem] border-primary hover:border-primary bg-secondary text-primary transition duration-300 text-sm">Add Meal</Link>

          <Link href={"/check-meal"} className="bg-primary text-neutral/80 font-semibold py-2 px-7 rounded-md border-[0.2rem] border-primary hover:border-primary hover:bg-secondary hover:text-primary transition duration-300 text-sm">Take Meal</Link>
        </CardFooter>
      </Card>
    </main >
  );
}
