"use client";

import { useAccessibility, Heading } from "@/components/ui/";
import { motion } from "framer-motion";
import { Heart, Users, Eye, Key, Speaker, Lightbulb } from "lucide-react";

export function Philosophy() {
  const { animationsEnabled } = useAccessibility();

  const MotionDiv = animationsEnabled ? motion.div : "div";

  const philosophyItems = [
    {
      icon: <Heart className="h-10 w-10 text-primary" />,
      title: "内側からやさしいサイト制作",
      description:
        "見た目だけでなく、構造からアクセシビリティを考慮したサイト制作を心がけています。",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "多様なユーザーへの配慮",
      description: "様々な障がいや環境を持つユーザーが平等に情報にアクセスできるよう設計します。",
    },
    {
      icon: <Eye className="h-10 w-10 text-primary" />,
      title: "情報の伝わりやすさを設計",
      description:
        "情報の構造や文章表現、視覚的な階層など、コンテンツが迷いなく伝わる設計を心がけます。",
    },
    {
      icon: <Key className="h-10 w-10 text-primary" />,
      title: "共同制作への配慮",
      description:
        "デザイナーや他の開発者と連携しやすいよう、構造や命名、コミュニケーションのしやすさにも気を配っています。",
    },
    {
      icon: <Speaker className="h-10 w-10 text-primary" />,
      title: "スクリーンリーダー対応",
      description: "適切なマークアップと代替テキストで、スクリーンリーダーでの体験を向上させます。",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-primary" />,
      title: "継続的な学習と改善",
      description:
        "アクセシビリティの基準や技術は常に進化しているため、継続的に学習し改善しています。",
    },
  ];

  const getMotionProps = (props: Record<string, unknown>) => {
    return animationsEnabled ? props : {};
  };

  return (
    <section id="philosophy" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6 mx-auto">
        <MotionDiv
          className="max-w-5xl mx-auto space-y-4"
          {...getMotionProps({
            initial: { opacity: 0, y: 20 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
          })}
        >
          <div className="space-y-2">
            <Heading subTitle="Philosophy">制作への考え方</Heading>
          </div>
        </MotionDiv>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {philosophyItems.map((item, index) => (
            <MotionDiv
              key={index}
              className="flex flex-col bg-background items-center space-y-2 rounded-lg border p-6 shadow-sm"
              {...getMotionProps({
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true },
                transition: { duration: 0.5, delay: index * 0.1 },
              })}
            >
              <div className="p-2">{item.icon}</div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
