import { Card, CardHeader, CardTitle, CardDescription} from "@/components/ui/Card"
import { Briefcase } from "lucide-react"
import { Link } from "react-router-dom"

const TravelPage = () => {
  return (
    <main className="w-full max-w-3xl animate-[fade-up_0.7s_ease-out] space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6b7280]">tabitsuzuri</p>
        <h2 className="text-2xl font-semibold text-[#111827]">旅綴</h2>
        <p className="text-sm text-[#4b5563]">旅に関する計画や情報を管理します。</p>
      </div>

      <Link to="/travel/packing" className="group block">
        <Card className="transition duration-200 group-hover:-translate-y-1 group-hover:bg-slate-50 group-hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] group-active:translate-y-0 group-active:scale-[0.99]">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecf4f5] text-[#0f766e]">
                <Briefcase className="h-6 w-6" />
              </span>
              <div>
                <CardTitle className="text-lg">Packing</CardTitle>
                <CardDescription className="mt-1 text-sm">旅行の持ち物リストを作成・管理します。</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    </main>
  )
}
export default TravelPage