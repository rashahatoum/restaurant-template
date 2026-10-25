"use client"

import { restaurantConfig } from "@/config/restaurant";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

interface NavBarProps {
    navbarItems: { icon: React.ReactNode; label: string; href: string }[];
}

const NavBar = ({ navbarItems }: NavBarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <header className="absolute inset-x-0 top-0 z-50 w-full">
            <nav className="mx-auto flex h-80 w-full items-center justify-between px-[8vw] bg-background/60">

                <Link href="/">
                    <Image
                        src={restaurantConfig.logo}
                        alt={restaurantConfig.name}
                        width={120}
                        height={120}
                    />
                </Link>

                <div className="hidden items-center gap-20 md:flex">
                    {navbarItems.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="flex items-center justify-center gap-4 text-base font-medium leading-none text-foreground transition-colors hover:text-primary [&>svg]:size-15 [&>svg]:shrink-0"
                        >
                            {link.icon}
                            <span className="text-center leading-none">{link.label}</span>
                        </Link>
                    ))}
                </div>

                <Link
                    href="/menu"
                    className="hidden md:flex rounded-4xl bg-primary px-15 py-5 text-lg font-bold text-background transition-opacity hover:opacity-90">
                    اطلب الآن
                </Link>

                <button
                    type="button"
                    aria-label="فتح القائمة"
                    className="flex md:hidden"
                    onClick={() => setIsOpen((prev) => !prev)}                >
                    <FiMenu className="text-2xl text-foreground" />
                </button>
                {isOpen && (
                    <div className="
                            fixed inset-0 z-50
                            h-dvh w-screen
                            overflow-hidden
                            bg-background
                            md:hidden
                        ">
                        <Image
                            src={restaurantConfig.navbar.mobileBackground}
                            alt=""
                            fill
                            aria-hidden="true"
                            sizes="100vw"
                            className="z-0 object-cover object-center opacity-50"
                        />

                        <div className="relative z-10 flex h-full flex-col">
                            <div className="flex shrink-0 items-center justify-between px-24 py-20">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="إغلاق القائمة"
                                    className="inline-flex items-center justify-center"
                                >
                                    <FiX className="text-3xl text-foreground" />
                                </button>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col items-center justify-between px-24 pb-40 pt-16">
                                <Image
                                    src={restaurantConfig.logo}
                                    alt={restaurantConfig.name}
                                    width={200}
                                    height={200}
                                />

                                <div className="flex flex-col items-center gap-15">
                                    {navbarItems.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.href}
                                            className="flex items-center justify-center gap-8 text-base font-bold leading-none text-foreground transition-colors hover:text-primary [&>svg]:size-20 [&>svg]:shrink-0"
                                        >
                                            {link.icon}
                                            <span className="text-center leading-none">{link.label}</span>
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    href="/menu"
                                    className="rounded-4xl mb-20 bg-primary px-15 py-5 text-lg font-bold text-background transition-opacity hover:opacity-90">
                                    اطلب الآن
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}

export default NavBar
