"use client";

import { useAccessibility, Heading } from "@/components/ui";
import { motion } from "framer-motion";
import { SquareArrowOutUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import profileImage from "@/assets/images/about/profile.jpg";

export function About() {
  const profileItems = [
    {
      title: "基本情報",
      items: [
        { name: "名前", value: "浅井 泰名" },
        { name: "出身地", value: "愛知県" },
      ],
    },
    {
      title: "使用技術",
      items: [
        {
          name: "言語・フレームワーク",
          value: "HTML & CSS / TypeScript / Astro / React（1年未満） / Next.js（1年未満）",
        },
        {
          name: "スタイリング",
          value: "Sass（BEM・FLOCSS設計） / CSS Modules / Tailwind CSS / Shadcn UI",
        },
        { name: "CMS", value: "WordPress / microCMS" },
        { name: "ツール・その他", value: "GitHub Actions / Figma / Adobe XD / Cursor" },
      ],
    },
    {
      title: "SNS",
      items: [
        {
          name: "GitHub",
          value: (
            <Link
              href="https://github.com/flat-asai"
              className="underline hover:no-underline"
              aria-label="GitHubへのリンク"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://github.com/flat-asai
              <SquareArrowOutUpRight className="w-4 h-4 inline-block ml-1" />
            </Link>
          ),
        },
        {
          name: "Wantedly",
          value: (
            <Link
              href="https://www.wantedly.com/id/yas613a"
              className="underline hover:no-underline"
              aria-label="Wantedlyへのリンク"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.wantedly.com/id/yas613a
              <SquareArrowOutUpRight className="w-4 h-4 inline-block ml-1" />
            </Link>
          ),
        },
      ],
    },
    {
      title: "その他",
      items: [
        {
          name: "登壇（2025年1月）",
          value: (
            <Link
              href="https://cssnite.doorkeeper.jp/events/179874"
              className="underline hover:no-underline"
              aria-label="登壇のリンク"
              target="_blank"
              rel="noopener noreferrer"
            >
              CSS Night
              #朝までマークアップ2（CSS編）『現場で役立つ失敗しないレイアウト作り！vw/vhの実践テクニック』
              <SquareArrowOutUpRight className="w-4 h-4 inline-block ml-1" />
            </Link>
          ),
        },
        {
          name: "インタビュー（2023年8月）",
          value: (
            <Link
              href="https://ttj.paiza.jp/archives/2023/08/02/10111/"
              className="underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              『女性エンジニアが語る「活躍」について：一人ひとりのライフプランに合わせた働き方へ』
              <SquareArrowOutUpRight className="w-4 h-4 inline-block ml-1" />
            </Link>
          ),
        },
      ],
    },
  ];
  const { animationsEnabled } = useAccessibility();

  const MotionDiv = animationsEnabled ? motion.div : "div";

  // Create a function to handle motion props
  const getMotionProps = (props: Record<string, unknown>) => {
    return animationsEnabled ? props : {};
  };

  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32">
      <div className="max-w-5xl px-4 md:px-6 mx-auto">
        <MotionDiv
          className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl object-cover object-center sm:w-full"
          {...getMotionProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5, delay: 0.2 },
          })}
        >
          <div>
            <Heading subTitle="About me">私について</Heading>
          </div>
        </MotionDiv>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <MotionDiv
            className="mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-xl object-cover object-center sm:w-full"
            {...getMotionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0.2 },
            })}
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
            {...getMotionProps({
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true },
              transition: { duration: 0.5, delay: 0.4 },
            })}
          >
            <div className="space-y-2">
              <h3 className="text-2xl md:text-4xl font-bold tracking-tighter leading-relaxed mb-8">
                アクセシビリティと、
                <br />
                すべての人のためのWebを。
              </h3>
              <div className="space-y-2 md:text-lg leading-relaxed">
                <p>私はWebが好きです。</p>
                <p>
                  その理由のひとつに、「すべての人々がアクセスできる可能性」がWebにはあると思っているからです。
                </p>
                <p>
                  だからこそ、障がいのある方々や、使う環境がそれぞれ異なる方々にも配慮しながら、
                  <br />
                  誰もが同じように情報と体験を享受できるWebサイトをつくりたいと考えています。
                </p>
                <p>
                  Webは、ただ情報を届けるための手段ではなく、
                  <br />
                  すべての人が平等にアクセスできる場所であってほしい。
                </p>
                <p>そう願いながら、日々の制作に取り組んでいます。</p>
              </div>
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          {...getMotionProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5, delay: 0.6 },
          })}
        >
          <section className="relative border pt-10 pb-6 px-6 rounded-md">
            <h3 className="absolute px-4 py-2 z-10 top-0 left-4 mb-4 flex items-center gap-4 -translate-y-1/2 bg-background">
              <span
                className="text-2xl md:text-3xl font-semibold uppercase"
                style={{ fontFamily: "var(--font-montserrat)" }}
                aria-hidden="true"
              >
                Profile
              </span>
              <span className="text-md font-semibold text-muted-foreground">プロフィール</span>
            </h3>
            {profileItems.map((item, index) => (
              <section
                key={index}
                className={`flex flex-col gap-4 ${index !== 0 ? "border-t pt-4 mt-4" : ""}`}
              >
                <h4 className="text-md font-semibold min-w-[12em]">{item.title}</h4>
                <dl className="text-sm flex flex-col gap-2 leading-relaxed">
                  {item.items.map((item, index) => (
                    <div className="md:flex gap-2" key={index}>
                      <dt className="min-w-[12em]">{item.name}</dt>
                      <dd className="break-words">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </section>
        </MotionDiv>
      </div>
    </section>
  );
}
