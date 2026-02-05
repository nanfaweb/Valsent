"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ScreenshotShowcase.module.css";

const screenshots = [
    {
        src: "/screenshots/ss1.png",
        title: "Your Personal Dashboard",
        description: "Track your progress, view stats, and access all mock exams in one place.",
    },
    {
        src: "/screenshots/ss2.png",
        title: "Detailed Question Review",
        description: "Review every question with correct answers.",
    },
    {
        src: "/screenshots/ss3.png",
        title: "Real Exam Experience",
        description: "Timed exams with question navigation just like the real test.",
    },
];

export function ScreenshotShowcase() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % screenshots.length);
    }, []);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(nextSlide, 4000);
        return () => clearInterval(interval);
    }, [isPaused, nextSlide]);

    const getSlideClass = (index: number) => {
        if (index === activeIndex) return styles.active;
        if (index === (activeIndex - 1 + screenshots.length) % screenshots.length) return styles.prev;
        if (index === (activeIndex + 1) % screenshots.length) return styles.next;
        return "";
    };

    return (
        <section className={styles.showcase}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>See What You Get</h2>
                    <p>Experience a premium exam preparation platform designed for success.</p>
                </div>

                <div
                    className={styles.carouselWrapper}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className={styles.carousel}>
                        {screenshots.map((screenshot, index) => (
                            <div
                                key={index}
                                className={`${styles.slide} ${getSlideClass(index)}`}
                            >
                                <div className={styles.screenshotCard}>
                                    <div className={styles.browserChrome}>
                                        <div className={styles.browserDots}>
                                            <span className={styles.dot}></span>
                                            <span className={styles.dot}></span>
                                            <span className={styles.dot}></span>
                                        </div>
                                        <div className={styles.urlBar}>valsent.com</div>
                                    </div>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={screenshot.src}
                                            alt={screenshot.title}
                                            fill
                                            className={styles.screenshotImage}
                                            priority={index === 0}
                                        />
                                    </div>
                                    <div className={styles.caption}>
                                        <h3>{screenshot.title}</h3>
                                        <p>{screenshot.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.arrows}>
                        <button className={styles.arrow} onClick={prevSlide} aria-label="Previous">
                            <ChevronLeft size={24} />
                        </button>
                        <button className={styles.arrow} onClick={nextSlide} aria-label="Next">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className={styles.dots}>
                    {screenshots.map((_, index) => (
                        <button
                            key={index}
                            className={`${styles.navDot} ${index === activeIndex ? styles.active : ""}`}
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
