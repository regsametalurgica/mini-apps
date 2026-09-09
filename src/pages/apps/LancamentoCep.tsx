import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCepStore } from '../../stores/cepStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

export const LancamentoCep = () => {
  const { data, isLoading, error, loadCarta, registerMeasurement, reset, matricula: storeMatricula, recurso: storeRecurso } = useCepStore();
  const [searchParams] = useSearchParams();

  // Sidebar State
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Modal State — só exibe se NÃO houver parâmetros na URL
  const hasUrlParams = !!(searchParams.get('op') && searchParams.get('matricula') && searchParams.get('recurso'));
  const [isModalOpen, setIsModalOpen] = useState(!hasUrlParams && !data);
  const [opInput, setOpInput] = useState('');
  const [recursoInput, setRecursoInput] = useState('');
  const [matriculaInput, setMatriculaInput] = useState('');
  const [numeroCartaInput, setNumeroCartaInput] = useState('');

  // Form State
  const [vValues, setVValues] = useState({ v1: '', v2: '', v3: '', v4: '', v5: '' });
  const [observacao, setObservacao] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isValidationErrorOpen, setIsValidationErrorOpen] = useState(false);

  // Data e Hora editáveis
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  // Flag para evitar chamada duplicada em StrictMode
  const autoLoadDone = useRef(false);

  // Carregamento automático via parâmetros da URL
  useEffect(() => {
    if (autoLoadDone.current) return;

    const op = searchParams.get('op');
    const matricula = searchParams.get('matricula');
    const numeroCarta = searchParams.get('numeroCarta') || '';
    const recurso = searchParams.get('recurso');

    if (op && matricula && recurso) {
      autoLoadDone.current = true;
      console.log('[CEP] Carregamento automático via URL:', { op, matricula, numeroCarta, recurso });
      loadCarta(op, matricula, recurso, numeroCarta).catch((err) => {
        console.error('[CEP] Erro no carregamento automático:', err);
      });
    }
  }, [searchParams, loadCarta]);

  // Cálculos automáticos
  const stats = useMemo(() => {
    const values = Object.values(vValues)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));

    if (values.length === 0) return { media: 0, range: 0 };

    const media = values.reduce((a, b) => a + b, 0) / values.length;
    const range = Math.max(...values) - Math.min(...values);

    return {
      media: parseFloat(media.toFixed(3)),
      range: parseFloat(range.toFixed(3))
    };
  }, [vValues]);

  const handleStart = async () => {
    if (!opInput) {
      alert("Por favor, digite o número da Ordem de Produção.");
      return;
    }

    if (!recursoInput) {
      alert("Por favor, digite o código do recurso.");
      return;
    }

    if (!matriculaInput) {
      alert("Por favor, digite a matrícula do operador.");
      return;
    }

    try {
      await loadCarta(opInput, matriculaInput, recursoInput, numeroCartaInput);
      setIsModalOpen(false);
    } catch (err) {
      console.error('[LancamentoCep] Erro ao carregar OP:', err);
    }
  };

  const handleCancel = () => {
    reset();
    setIsModalOpen(true);
  };

  // Lógica de navegação com Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const fields = ['v1', 'v2', 'v3', 'v4', 'v5'];
      const currentIndex = fields.indexOf(field);

      if (currentIndex < fields.length - 1) {
        const nextField = document.querySelector(`input[name="${fields[currentIndex + 1]}"]`) as HTMLInputElement;
        nextField?.focus();
      } else {
        handleRegister();
      }
    }
  };

  const handleRegister = async () => {
    const values = Object.values(vValues).map(v => parseFloat(v));
    if (values.some(v => isNaN(v))) {
      setIsValidationErrorOpen(true);
      return;
    }

    // Monta a dataHora unindo data e hora informados na tela
    const dataHora = `${selectedDate}T${selectedTime}:00`;

    setIsSaving(true);
    const startTime = Date.now();

    try {
      await registerMeasurement({
        v1: values[0],
        v2: values[1],
        v3: values[2],
        v4: values[3],
        v5: values[4],
        media: stats.media,
        range: stats.range,
        observacao,
        dataHora
      });

      // Garante no mínimo 3 segundos de animação
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 3000) {
        await new Promise(resolve => setTimeout(resolve, 3000 - elapsedTime));
      }

      // Limpar formulário e focar no primeiro campo
      setVValues({ v1: '', v2: '', v3: '', v4: '', v5: '' });
      setObservacao('');
      const firstField = document.querySelector('input[name="v1"]') as HTMLInputElement;
      firstField?.focus();
    } catch (err) {
      console.error('[LancamentoCep] Erro ao registrar medição:', err);
      alert("Erro ao registrar medição. Verifique a conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  // Tela de carregamento quando veio da URL e ainda está carregando
  if (hasUrlParams && isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center bg-background-main">
        <div className="flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-4 border-border-main border-t-primary rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-content-main font-bold text-[16px]">Carregando carta CEP...</p>
            <p className="text-content-tertiary text-[13px] mt-1">OP: {searchParams.get('op')} | Recurso: {searchParams.get('recurso')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de erro quando veio da URL e falhou
  if (hasUrlParams && error && !data) {
    return (
      <div className="flex h-full items-center justify-center bg-background-main">
        <div className="flex flex-col items-center gap-6 max-w-[400px] text-center">
          <div className="w-14 h-14 rounded-full bg-status-error/10 flex items-center justify-center text-status-error text-[28px]">
            <i className="bi bi-exclamation-octagon"></i>
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-content-main mb-2">Erro ao carregar carta</h2>
            <p className="text-[13px] text-content-secondary bg-status-error/10 border border-status-error/20 p-4 rounded-lg">
              {error}
            </p>
          </div>
          <p className="text-[12px] text-content-tertiary">
            OP: {searchParams.get('op')} | Matrícula: {searchParams.get('matricula')} | Recurso: {searchParams.get('recurso')}
          </p>
        </div>
      </div>
    );
  }

  if (isModalOpen || !data) {
    return (
      <Modal isOpen={true} onClose={handleCancel}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-[20px] font-bold text-content-main flex items-center gap-3">
              <i className="bi bi-search text-primary"></i>
              Iniciar Controle CEP
            </h2>
            <p className="text-[14px] text-content-tertiary">
              Informe os dados para carregar a carta correspondente.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Matrícula do Operador"
              placeholder="Ex: 51"
              value={matriculaInput}
              onChange={(e) => setMatriculaInput(e.target.value)}
              autoFocus
              icon="bi-person-badge"
            />

            <Input
              label="Código do Recurso"
              placeholder="Ex: 513"
              value={recursoInput}
              onChange={(e) => setRecursoInput(e.target.value)}
              icon="bi-gear"
            />

            <Input
              label="Número da Ordem de Produção (OP)"
              placeholder="Ex: 079201"
              value={opInput}
              onChange={(e) => setOpInput(e.target.value)}
              icon="bi-hash"
            />

            <Input
              label="Número da Carta (opcional)"
              placeholder="Ex: 000033"
              value={numeroCartaInput}
              onChange={(e) => setNumeroCartaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              icon="bi-file-earmark-text"
            />

            {error && (
              <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/20 flex items-center gap-3">
                <i className="bi bi-exclamation-triangle-fill text-status-error"></i>
                <span className="text-[12px] text-status-error font-medium">{error}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleStart} isLoading={isLoading} className="flex-1 whitespace-nowrap !px-2">
              INICIAR PROCESSO
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Verificadores de Limites
  const isXbarOut = stats.media > data.limitesControle.xbar.lsc || stats.media < data.limitesControle.xbar.lic;
  const isRangeOut = stats.range > data.limitesControle.range.lsc || stats.range < data.limitesControle.range.lic;

  // Configuração dos Gráficos
  const createChartOptions = (title: string, limits: { lsc: number; media: number; lic: number }, chartData: number[]) => {
    // Calcula o min/max considerando os limites de controle E os dados plotados
    const allValues = [...chartData.filter(v => !isNaN(v)), limits.lsc, limits.media, limits.lic];
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const range = dataMax - dataMin;
    // Padding de 15% acima e abaixo para dar respiro visual
    const padding = Math.max(range * 0.15, 0.01);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: { color: '#4A5568', font: { size: 10 } }
        },
        title: {
          display: true,
          text: title,
          color: '#1D2630',
          align: 'start' as const,
          font: { size: 12, weight: 'bold' as const },
          padding: { top: 0, bottom: 6 }
        },
        annotation: {
          annotations: {
            lsc: {
              type: 'line' as const,
              yMin: limits.lsc,
              yMax: limits.lsc,
              borderColor: 'rgba(239, 68, 68, 0.8)',
              borderWidth: 1.5,
              borderDash: [5, 5],
              label: { display: true, content: `LSC (${limits.lsc})`, position: 'end' as const, backgroundColor: 'rgba(255,255,255,0.9)', color: '#EF4444', font: { size: 9 } }
            },
            media: {
              type: 'line' as const,
              yMin: limits.media,
              yMax: limits.media,
              borderColor: 'rgba(0, 0, 0, 0.2)',
              borderWidth: 1.5,
              borderDash: [2, 2],
              label: { display: true, content: `Média (${limits.media})`, position: 'end' as const, backgroundColor: 'rgba(255,255,255,0.9)', color: '#1D2630', font: { size: 9 } }
            },
            lic: {
              type: 'line' as const,
              yMin: limits.lic,
              yMax: limits.lic,
              borderColor: 'rgba(239, 68, 68, 0.8)',
              borderWidth: 1.5,
              borderDash: [5, 5],
              label: { display: true, content: `LIC (${limits.lic})`, position: 'end' as const, backgroundColor: 'rgba(255,255,255,0.9)', color: '#EF4444', font: { size: 9 } }
            }
          }
        }
      },
      scales: {
        y: {
          min: parseFloat((dataMin - padding).toFixed(4)),
          max: parseFloat((dataMax + padding).toFixed(4)),
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: '#4A5568', font: { size: 10 } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#4A5568', font: { size: 10 } }
        }
      }
    };
  };

  const xbarData = {
    labels: data.historico.labels,
    datasets: [{
      label: 'Média',
      data: data.historico.xbar,
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F6',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1,
      pointBackgroundColor: data.historico.xbar.map(val =>
        (val > data.limitesControle.xbar.lsc || val < data.limitesControle.xbar.lic) ? '#EF4444' : '#3B82F6'
      ),
      pointBorderColor: data.historico.xbar.map(val =>
        (val > data.limitesControle.xbar.lsc || val < data.limitesControle.xbar.lic) ? '#EF4444' : '#3B82F6'
      )
    }]
  };

  const rangeData = {
    labels: data.historico.labels,
    datasets: [{
      label: 'Amplitude',
      data: data.historico.range,
      borderColor: '#10B981',
      backgroundColor: '#10B981',
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.1,
      pointBackgroundColor: data.historico.range.map(val =>
        (val > data.limitesControle.range.lsc || val < data.limitesControle.range.lic) ? '#EF4444' : '#10B981'
      ),
      pointBorderColor: data.historico.range.map(val =>
        (val > data.limitesControle.range.lsc || val < data.limitesControle.range.lic) ? '#EF4444' : '#10B981'
      )
    }]
  };

  return (
    <div className="flex h-full bg-background-main text-content-main overflow-hidden relative">
      {/* MENU ESQUERDO — Área Operacional */}
      <div className="w-[380px] bg-background-secondary border-r border-border-main p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
        {/* Info Editável */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1"
            disabled={data.autorizagravar === false}
          />
          <Input
            label="Hora"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="flex-1"
            disabled={data.autorizagravar === false}
          />
        </div>

        <Input
          label="Operador (Matrícula)"
          value={storeMatricula || '---'}
          readOnly
          className="opacity-70"
          icon="bi-person"
        />

        {/* Banner de Lançamento Bloqueado pelo ERP */}
        {data.autorizagravar === false && (
          <div className="p-3.5 rounded-lg bg-status-error/10 border border-status-error/20 flex items-start gap-3">
            <i className="bi bi-shield-slash text-status-error text-[18px] shrink-0 mt-0.5"></i>
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-status-error font-bold leading-tight">Carta Finalizada</span>
              <span className="text-[11px] text-status-error/85 leading-normal">
                Você não pode adicionar mais registros para essa carta.
              </span>
            </div>
          </div>
        )}

        {/* Medições */}
        <div className="flex flex-col gap-3">
          <label className="text-[12px] font-bold text-content-tertiary uppercase tracking-wider">Valores Registrados</label>
          <div className="grid grid-cols-5 gap-2">
            {['v1', 'v2', 'v3', 'v4', 'v5'].map((v) => (
              <input
                key={v}
                name={v}
                type="number"
                placeholder={v.toUpperCase()}
                value={vValues[v as keyof typeof vValues]}
                onChange={(e) => setVValues({ ...vValues, [v]: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, v)}
                className="h-10 bg-background-main border border-border-main rounded-lg px-2 text-[13px] focus:outline-none focus:border-primary transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-background-secondary"
                disabled={data.autorizagravar === false}
              />
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-content-tertiary">Média (Xbar)</label>
            <div className={`h-10 bg-background-card border border-border-main rounded-lg flex items-center px-4 font-mono font-bold transition-colors ${isXbarOut ? 'text-status-error' : 'text-primary'
              }`}>
              {stats.media}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-content-tertiary">Amplitude (Range)</label>
            <div className={`h-10 bg-background-card border border-border-main rounded-lg flex items-center px-4 font-mono font-bold transition-colors ${isRangeOut ? 'text-status-error' : 'text-primary'
              }`}>
              {stats.range}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] text-content-tertiary">Observação (opcional)</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full bg-background-main border border-border-main rounded-lg p-3 text-[13px] min-h-[80px] focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-background-secondary"
            placeholder="Digite observações do processo..."
            disabled={data.autorizagravar === false}
          />
        </div>

        <Button 
          onClick={handleRegister} 
          className="w-full h-12 text-[15px] font-bold"
          disabled={data.autorizagravar === false}
        >
          REGISTRAR MEDIÇÃO
        </Button>
      </div>

      {/* GRÁFICOS CENTRAIS */}
      <div className="flex-1 flex justify-start items-start pt-4 pb-8 pl-4 pr-8 lg:pt-6 lg:pb-12 lg:pl-6 lg:pr-12 overflow-hidden">
        <div className="w-full h-full max-w-5xl max-h-[85vh] flex flex-col gap-6">
          <div className="flex-1 bg-background-secondary border border-border-main rounded-lg p-4 min-h-0 shadow-sm">
            <Line options={createChartOptions('Média (Xbar)', data.limitesControle.xbar, data.historico.xbar)} data={xbarData} />
          </div>
          <div className="flex-1 bg-background-secondary border border-border-main rounded-lg p-4 min-h-0 shadow-sm">
            <Line options={createChartOptions('Amplitude (Range)', data.limitesControle.range, data.historico.range)} data={rangeData} />
          </div>
        </div>
      </div>

      {/* MENU DIREITO COLAPSÁVEL — Dados da Carta */}
      <div
        className={`bg-background-secondary border-l border-border-main transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col ${isRightSidebarOpen ? 'w-[280px]' : 'w-[48px]'
          }`}
      >
        {/* Toggle Button Strip */}
        <div className="h-14 flex items-center justify-center border-b border-border-main shrink-0">
          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isRightSidebarOpen ? 'bg-primary/10 text-primary' : 'text-content-tertiary hover:text-content-main'
              }`}
            title={isRightSidebarOpen ? "Recolher informações" : "Ver informações da carta"}
          >
            <i className={`bi ${isRightSidebarOpen ? 'bi-chevron-right' : 'bi-info-circle'} text-[18px]`}></i>
          </button>
        </div>

        {/* Content - Only visible when open */}
        <div className={`p-6 flex flex-col gap-6 overflow-y-auto transition-opacity duration-200 ${isRightSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
          <h3 className="text-[12px] font-bold text-content-tertiary uppercase tracking-widest border-b border-border-main pb-3 whitespace-nowrap">
            Dados da Carta
          </h3>

          <div className="flex flex-col gap-5">
            {[
              { label: 'Ordem de Produção', value: data.op },
              { label: 'Nº Carta', value: data.numeroCarta },
              { label: 'Nº Peça', value: data.numeroPeca },
              { label: 'Equipamento', value: data.equipamento },
              { label: 'Característica', value: data.caracteristica },
              { label: 'Sequência', value: data.sequencia },
              { label: 'Revisão da Ficha', value: data.revisaoFicha },
              { label: 'Setor', value: data.setor },
              { label: 'Especificação', value: data.especificacao },
              { label: 'Cliente', value: data.cliente },
              { label: 'Tam. Amostra', value: data.tamanhoAmostra },
              { label: 'Frequência', value: data.frequencia },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-[10px] text-content-tertiary uppercase font-medium whitespace-nowrap">{item.label}</span>
                <span className="text-[13px] text-content-secondary font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Salvamento */}
      {isSaving && (
        <Modal isOpen={true} onClose={() => {}} hideCloseButton={true}>
          <div className="flex flex-col items-center justify-center py-8 gap-6">
            <div className="w-12 h-12 border-4 border-border-main border-t-primary rounded-full animate-spin"></div>
            <p className="text-content-main font-medium text-[16px]">
              Registrando dados de CEP, aguarde...
            </p>
          </div>
        </Modal>
      )}
      {/* Modal de Validação de Medições */}
      {isValidationErrorOpen && (
        <Modal isOpen={true} onClose={() => setIsValidationErrorOpen(false)}>
          <div className="flex flex-col gap-6 text-center py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-status-error/10 flex items-center justify-center text-status-error text-[24px]">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <h2 className="text-[18px] font-bold text-content-main">
                Valores Incompletos
              </h2>
              <p className="text-[13px] text-content-tertiary">
                Por favor, preencha todos os valores de medição (V1 a V5) antes de registrar.
              </p>
            </div>
            <div className="flex pt-2">
              <Button onClick={() => setIsValidationErrorOpen(false)} className="flex-1">
                ENTENDIDO
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

