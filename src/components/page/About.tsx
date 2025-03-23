"use client";

import { useAccessibility } from "@/components/ui/AccessibilityProvider";
import { motion } from "framer-motion";
import Image from "next/image";
import profileImage from "@/assets/images/dummy.png";

export function About() {
  const { animationsEnabled } = useAccessibility();

  const MotionDiv = animationsEnabled ? motion.div : "div";

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6 mx-auto">
        <MotionDiv
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial={animationsEnabled ? { opacity: 0, y: 20 } : {}}
          whileInView={animationsEnabled ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              私について
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              アクセシビリティとユーザー体験を最優先に考えたWebサイト制作を行っています
            </p>
          </div>
        </MotionDiv>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <MotionDiv
            className="mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-xl object-cover object-center sm:w-full"
            initial={animationsEnabled ? { opacity: 0, x: -50 } : {}}
            whileInView={animationsEnabled ? { opacity: 1, x: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              alt="プロフィール写真"
              src={profileImage}
              className="aspect-square object-cover"
              height={500}
              width={500}
            />
          </MotionDiv>
          <MotionDiv
            className="flex flex-col justify-center space-y-4"
            initial={animationsEnabled ? { opacity: 0, x: 50 } : {}}
            whileInView={animationsEnabled ? { opacity: 1, x: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                アクセシビリティへの主体的な取り組み
              </h3>
              <p className="text-muted-foreground md:text-lg">
                私はWebが好きです。その理由のひとつに、Webが持つ「すべての人々がアクセスできる可能性」に魅力を感じているからです。
              </p>
              <p className="text-muted-foreground md:text-lg">
                だからこそ、障がいのある方々や多様な利用環境に配慮し、誰もが同じ情報と体験を享受できるWebサイトを作りたいと考えています。
              </p>
              <p className="text-muted-foreground md:text-lg">
                私にとって、Webは単に情報を提供する手段ではなく、すべての人が平等にアクセスできる場所であってほしいと思っています。
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
