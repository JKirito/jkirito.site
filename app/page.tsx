export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <main className="flex flex-col items-center gap-6 text-center px-6">
        <h1 className="text-5xl font-bold tracking-tight">
          jkirito.site
        </h1>
        <p className="text-lg text-zinc-400 max-w-md">
          Welcome. This site is under construction.
        </p>
        <div className="mt-4 h-px w-24 bg-zinc-700" />
        <p className="text-sm text-zinc-500">
          Deployed on Vercel
        </p>
      </main>
    </div>
  );
}
