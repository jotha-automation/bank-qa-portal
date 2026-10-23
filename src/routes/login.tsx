import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Building2, KeyRound, User } from "lucide-react";
import { getSession, login } from "@/lib/store";
import { DEMO_REQ } from "@/lib/demo-config";
import { TIPOS_ID } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Banco Empresarial · Acceso" },
      { name: "description", content: "Portal empresarial transaccional (entorno mock para pruebas QA)." },
      { name: "aptp:req", content: DEMO_REQ.id },
      { name: "aptp:target-app", content: "bank-qa-portal" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState("312");
  const [tipoId, setTipoId] = useState("Cédula de Ciudadanía");
  const [numDocumento, setNumDocumento] = useState("");
  const [clave, setClave] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getSession()) navigate({ to: "/dashboard" });
  }, [navigate]);

  // OPTIMIZATION: Removed artificial 400ms delay for faster Playwright execution
  // In production this would be an actual API call; for demo we process immediately
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Use microtask instead of setTimeout for immediate execution while preserving state update order
    Promise.resolve().then(() => {
      const res = login(cliente, tipoId, numDocumento.trim(), clave.trim(), token.trim() || undefined);
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      navigate({ to: "/dashboard" });
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30" data-testid="login-page">
      <div className="brand-bar" />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 hidden md:block">
            <div className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold tracking-wide">
              <ShieldCheck className="h-4 w-4" /> ENTORNO DE PRUEBAS · APTP · {DEMO_REQ.id}
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              Portal Empresarial<br />
              <span className="text-primary">Banco</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              Portal Transaccional para grandes empresas con funcionalidades de Pagos,
              Consultas, Transferencias e Inscripciones ACH. Mock alineado con la suite
              TestLink <span className="font-mono text-xs">{DEMO_REQ.suite}</span>.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md text-sm">
              <Card className="p-4 shadow-none border-border/70">
                <Building2 className="h-5 w-5 text-primary mb-2" />
                <div className="font-medium">14 empresas</div>
                <div className="text-muted-foreground text-xs">contratadas</div>
              </Card>
              <Card className="p-4 shadow-none border-border/70">
                <KeyRound className="h-5 w-5 text-primary mb-2" />
                <div className="font-medium">Token / CV</div>
                <div className="text-muted-foreground text-xs">doble factor</div>
              </Card>
            </div>
          </div>

          <Card className="p-8 shadow-lg border-border/70">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">D</div>
              <div>
                <div className="font-semibold">Acceso Empresarial</div>
                <div className="text-xs text-muted-foreground">Ingrese sus credenciales</div>
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
              <div className="space-y-1.5">
                <Label htmlFor="cliente">Código de cliente</Label>
                <Input
                  id="cliente"
                  data-testid="login-cliente"
                  placeholder="Ej: 312"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de identificación</Label>
                <Select value={tipoId} onValueChange={setTipoId}>
                  <SelectTrigger data-testid="login-tipo-id"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_ID.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="num">Número de documento</Label>
                <Input
                  id="num"
                  data-testid="login-documento"
                  placeholder="Ej: 20242587"
                  value={numDocumento}
                  onChange={(e) => setNumDocumento(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clave">Clave</Label>
                <Input
                  id="clave"
                  data-testid="login-clave"
                  type="password"
                  placeholder="••••••"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  data-testid="login-token"
                  placeholder="Requerido si su usuario tiene token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive" data-testid="login-error" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit">
                {loading ? "Validando..." : "Ingresar"}
              </Button>
            </form>
            <div className="mt-6 rounded-md border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground" data-testid="login-hints">
              <div className="font-medium text-foreground flex items-center gap-1.5 mb-1">
                <User className="h-3.5 w-3.5" /> Usuario demo principal (EMPRESARIAL-13327)
              </div>
              Cliente <span className="font-mono">312</span> · CC · doc <span className="font-mono">20242587</span> · clave <span className="font-mono">123456</span> · token <span className="font-mono">63866019</span>
              <div className="mt-1">Sin token: cliente <span className="font-mono">201319</span> · doc <span className="font-mono">1233896904</span> · clave <span className="font-mono">2023</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
