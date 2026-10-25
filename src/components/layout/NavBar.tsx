"use client"

import { restaurantConfig } from "@/config/restaurant";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiHome, FiMapPin, FiMenu, FiPhone, FiUser, FiX } from "react-icons/fi";
import { MdOutlineRestaurant } from "react-icons/md";

const navIcons = {
    home: FiHome,
    menu: MdOutlineRestaurant,
    about: FiUser,
    location: FiMapPin,
    contact: FiPhone,
};

const { links, orderAction } = restaurantConfig.navbar;

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // showModal() has no React prop equivalent; it gives us Escape-to-close,
    // a focus trap, and focus return to the toggle for free.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

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
                    {links.map((link) => {
                        const Icon = navIcons[link.icon];
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-center gap-4 text-base font-medium leading-none text-foreground transition-colors hover:text-primary [&>svg]:size-15 [&>svg]:shrink-0"
                            >
                                <Icon />
                                <span className="text-center leading-none">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                <Link
                    href={orderAction.href}
                    className="hidden md:flex rounded-4xl bg-primary px-15 py-5 text-lg font-bold text-background transition-opacity hover:opacity-90">
                    {orderAction.label}
                </Link>

                <button
                    type="button"
                    aria-label="فتح القائمة"
                    aria-expanded={isOpen}
                    aria-controls="mobile-menu"
                    className="flex md:hidden"
                    onClick={() => setIsOpen(true)}
                >
                    <FiMenu className="text-2xl text-foreground" />
                </button>
                <dialog
                    ref={dialogRef}
                    id="mobile-menu"
                    aria-label="القائمة"
                    onClose={closeMenu}
                    className="
                            fixed inset-0
                            h-dvh w-screen
                            max-h-none max-w-none
                            overflow-hidden
                            bg-background
                            text-foreground
                            md:hidden
                        "
                >
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
                                    onClick={closeMenu}
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
                                    {links.map((link) => {
                                        const Icon = navIcons[link.icon];
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={closeMenu}
                                                className="flex items-center justify-center gap-8 text-base font-bold leading-none text-foreground transition-colors hover:text-primary [&>svg]:size-20 [&>svg]:shrink-0"
                                            >
                                                <Icon />
                                                <span className="text-center leading-none">{link.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>

                                <Link
                                    href={orderAction.href}
                                    onClick={closeMenu}
                                    className="rounded-4xl mb-20 bg-primary px-15 py-5 text-lg font-bold text-background transition-opacity hover:opacity-90">
                                    {orderAction.label}
                                </Link>
                            </div>
                        </div>
                </dialog>
            </nav>
        </header>
    )
}

export default NavBar
