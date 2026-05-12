import { useState, useEffect, useMemo } from 'react';
import { useCepStore } from '../../stores/cepStore';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
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
  const { data, registerMeasurement, isLoading } = useCepStore();
  const user = useAuthStore((state) => state.user);

  // Form State
  const [vValues, setVValues] = useState({ v1: '', v2: '', v3: '', v4: '', v5: '' });
  const [observacao, setObservacao] = useState('');
  
  // Data e Hora editáveis
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));


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

  const handleRegister = () => {
    const values = Object.values(vValues).map(v => parseFloat(v));
    if (values.some(v => isNaN(v))) {
      alert("Por favor, preencha todos os valores (V1 a V5).");
      return;
    }

    registerMeasurement({
      v1: values[0],
      v2: values[1],
      v3: values[2],
      v4: values[3],
      v5: values[4],
      media: stats.media,
      range: stats.range,
      observacao
    });

    // Limpar formulário e focar no primeiro campo
    setVValues({ v1: '', v2: '', v3: '', v4: '', v5: '' });
    setObservacao('');
    const firstField = document.querySelector('input[name="v1"]') as HTMLInputElement;
    firstField?.focus();
  };

  if (!data) return <div className="p-8 text-center">Carregando dados da carta...</div>;

  // Verificadores de Limites
  const isXbarOut = stats.media > data.limitesControle.xbar.lsc || stats.media < data.limitesControle.xbar.lic;
  const isRangeOut = stats.range > data.limitesControle.range.lsc || stats.range < data.limitesControle.range.lic;

  // Configuração dos Gráficos
  const createChartOptions = (title: string, limits: { lsc: number; media: number; lic: number }) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#888', font: { size: 10 } }
      },
      title: {
        display: true,
        text: title,
        color: '#E1E1E1',
        align: 'start' as const,
        font: { size: 16, weight: '600' }
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
            label: { display: true, content: `LSC (${limits.lsc})`, position: 'end' as const, backgroundColor: 'rgba(0,0,0,0.5)', font: { size: 9 } }
          },
          media: {
            type: 'line' as const,
            yMin: limits.media,
            yMax: limits.media,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            borderWidth: 1.5,
            borderDash: [2, 2],
            label: { display: true, content: `Média (${limits.media})`, position: 'end' as const, backgroundColor: 'rgba(0,0,0,0.5)', font: { size: 9 } }
          },
          lic: {
            type: 'line' as const,
            yMin: limits.lic,
            yMax: limits.lic,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 1.5,
            borderDash: [5, 5],
            label: { display: true, content: `LIC (${limits.lic})`, position: 'end' as const, backgroundColor: 'rgba(0,0,0,0.5)', font: { size: 9 } }
          }
        }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#666', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 10 } }
      }
    }
  });

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
    <div className="flex h-full bg-[#0F0F0F] text-content-main overflow-hidden">
      {/* MENU ESQUERDO — Área Operacional */}
      <div className="w-[380px] bg-background-secondary border-r border-border-main p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
        {/* Resumo Topo */}
        <div className="grid grid-cols-4 gap-4 pb-6 border-b border-border-main">
          <div>
            <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-wider">OP</p>
            <p className="text-[14px] font-semibold text-primary">{data.op}</p>
          </div>
          <div>
            <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-wider">Carta nº</p>
            <p className="text-[14px] font-semibold text-primary">{data.numeroCarta}</p>
          </div>
          <div>
            <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-wider">CP</p>
            <p className="text-[14px] font-semibold text-green-500">{data.cp}</p>
          </div>
          <div>
            <p className="text-[10px] text-content-tertiary uppercase font-bold tracking-wider">CPK</p>
            <p className="text-[14px] font-semibold text-green-500">{data.cpk}</p>
          </div>
        </div>

        {/* Info Editável */}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Data" 
            type="date"
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1"
          />
          <Input 
            label="Hora" 
            type="time"
            value={selectedTime} 
            onChange={(e) => setSelectedTime(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <Input 
          label="Operador" 
          value={user?.nome || 'Não Logado'} 
          readOnly 
          className="opacity-70"
          icon="bi-person"
        />

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
                className="h-10 bg-background-main border border-border-main rounded-lg px-2 text-[13px] focus:outline-none focus:border-primary transition-colors text-center"
              />
            ))}
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-content-tertiary">Média (Xbar)</label>
            <div className={`h-10 bg-[#161616] border border-border-main rounded-lg flex items-center px-4 font-mono font-bold transition-colors ${
              isXbarOut ? 'text-status-error' : 'text-primary'
            }`}>
              {stats.media}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-content-tertiary">Amplitude (Range)</label>
            <div className={`h-10 bg-[#161616] border border-border-main rounded-lg flex items-center px-4 font-mono font-bold transition-colors ${
              isRangeOut ? 'text-status-error' : 'text-primary'
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
            className="w-full bg-background-main border border-border-main rounded-lg p-3 text-[13px] min-h-[80px] focus:outline-none focus:border-primary transition-colors"
            placeholder="Digite observações do processo..."
          />
        </div>

        <Button onClick={handleRegister} className="w-full h-12 text-[15px] font-bold">
          REGISTRAR MEDIÇÃO
        </Button>
      </div>

      {/* GRÁFICOS CENTRAIS */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        <div className="flex-1 bg-background-secondary border border-border-main rounded-xl p-4 min-h-0">
          <Line options={createChartOptions('Média (Xbar)', data.limitesControle.xbar)} data={xbarData} />
        </div>
        <div className="flex-1 bg-background-secondary border border-border-main rounded-xl p-4 min-h-0">
          <Line options={createChartOptions('Amplitude (Range)', data.limitesControle.range)} data={rangeData} />
        </div>
      </div>

      {/* MENU FIXO DIREITO — Dados da Carta */}
      <div className="w-[300px] bg-background-secondary border-l border-border-main p-6 shrink-0 overflow-y-auto hidden xl:flex flex-col gap-6">
        <h3 className="text-[14px] font-bold text-content-tertiary uppercase tracking-widest border-b border-border-main pb-3">
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
              <span className="text-[10px] text-content-tertiary uppercase font-medium">{item.label}</span>
              <span className="text-[13px] text-content-secondary font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

