export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-10 sm:px-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-sm font-semibold tracking-wide text-teal-700">
          ગુજરાત સરકાર માટે કાર્યપ્રવાહ વ્યવસ્થાપન
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          સેવા સેતુ
        </h1>
        <p className="mt-2 text-base text-slate-600">
          આવક પ્રમાણપત્ર અરજીઓ માટેનું કાર્યપ્રવાહ પ્લેટફોર્મ
        </p>
      </header>

      <section
        aria-labelledby="foundation-heading"
        className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2
          id="foundation-heading"
          className="text-xl font-semibold text-slate-900"
        >
          પ્રોજેક્ટનો પાયો તૈયાર થઈ રહ્યો છે
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          આ પ્લેટફોર્મ અધિકારીઓને આવક પ્રમાણપત્ર અરજીઓની પ્રક્રિયા કરવામાં મદદ
          કરશે. દરેક અંતિમ નિર્ણય અધિકૃત અધિકારી દ્વારા લેવામાં આવશે.
        </p>
      </section>
    </main>
  );
}
