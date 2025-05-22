import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function ErrorCoshiiCat() {
    const router = useRouter();
    return (
        <div className="flex min-h-screen max-w-md flex-col items-center mx-auto justify-center bg-[#FED15B] px-4 text-center">
            <Image
                src="/coshii-cat.png"
                alt="Coshii Cat"
                width={192}
                height={192}
                className="mb-8 mt-16"
            />
            <p className="text-lg font-medium text-gray-900 mb-2 mx-10">
                Sorry, Coshii Cat says you can’t access this page meow
            </p>
            <Button
                variant="ghost"
                className="mt-4 rounded-full bg-white px-6 py-3 text-black font-semibold shadow-lg transition hover:scale-105"
                onClick={() => router.push("/")}
                >
                Coshii.com
            </Button>
        </div>
      );
  }
  