import { Header, Hero, Footer } from "@/components/layout/";
import { Works, About, Philosophy } from "@/components/page";
import { client } from "@/lib/client";
import { Work } from "@/cms/types/generated/work";
import { Category } from "@/cms/types/generated/category";
import { Suspense } from "react";

export default async function Home() {
  const works = await client.getList<Work>({ endpoint: "works" });
  const categories = await client.getList<Category>({ endpoint: "category" });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        <Philosophy />
        <Suspense
          fallback={<div className="container mx-auto px-4 py-12 text-center">読み込み中...</div>}
        >
          <Works works={works.contents} categories={categories.contents} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
