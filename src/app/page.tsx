// src/app/page.tsx
import { client } from "@/libs/client";
import { Work } from "@/cms/types/generated/work";

const Home = async () => {
  const data = await client.getList<Work>({ endpoint: "works" });
  console.log(data);

  return (
    <main className="p-6">
      <div className="grid gap-4">
        {data.contents.map((work) => (
          <div key={work.id}>
            <h2>{work.title}</h2>
            <p>{work.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
