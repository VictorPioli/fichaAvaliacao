import { useEffect, useState } from 'react'
import { generateFichaPdf } from './pdf'
import styles from './App.module.css'

type Ficha = {
  nome: string
  idade: number | ''
  sexo: 'M' | 'F' | ''
  massaCorporal: number | ''
  estatura: number | ''
  ocupacao: string
  objetivos: string
  habitosDeVida: string
  praticaExercicio: 'Sim' | 'Não' | ''
  qualExercicio?: string
  qualidadeSono: 'ruim' | 'regular' | 'bom' | ''
  alimentacao: 'ruim' | 'regular' | 'bom' | ''
  nivelEstresse: 'baixo' | 'medio' | 'alto' | ''
  historiaMedica: string
  diagnosticoClinico: string
  lesoesCirurgias: 'Sim' | 'Não' | ''
  quaisLesoes?: string
  queixaDor: string
  limitacaoAVD: 'baixo' | 'medio' | 'alto' | ''
  terapiasAnteriores: 'Sim' | 'Não' | ''
  quaisTerapias?: string
  usoMedicamentos: 'Sim' | 'Não' | ''
  quaisMedicamentos?: string
  terapiasConcomitantes: 'Sim' | 'Não' | ''
  quaisTerapiasConcomitantes?: string
  historicoFamiliar: string
  familiarDoencas: 'Sim' | 'Não' | ''
  quaisDoencasFamilia?: string
}

const STORAGE_KEY = 'ficha-avaliacao-v1'

export default function App() {
  const [ficha, setFicha] = useState<Ficha>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {
      nome: '', idade: '', sexo: '', massaCorporal: '', estatura: '', ocupacao: '', objetivos: '', habitosDeVida: '',
      praticaExercicio: '', qualExercicio: '', qualidadeSono: '', alimentacao: '', nivelEstresse: '', historiaMedica: '',
      diagnosticoClinico: '', lesoesCirurgias: '', quaisLesoes: '', queixaDor: '', limitacaoAVD: '', terapiasAnteriores: '',
      quaisTerapias: '', usoMedicamentos: '', quaisMedicamentos: '', terapiasConcomitantes: '', quaisTerapiasConcomitantes: '',
      historicoFamiliar: '', familiarDoencas: '', quaisDoencasFamilia: ''
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ficha))
  }, [ficha])

  const update = (k: keyof Ficha, v: any) => setFicha(p => ({ ...p, [k]: v }))

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setFicha({
      nome: '', idade: '', sexo: '', massaCorporal: '', estatura: '', ocupacao: '', objetivos: '', habitosDeVida: '',
      praticaExercicio: '', qualExercicio: '', qualidadeSono: '', alimentacao: '', nivelEstresse: '', historiaMedica: '',
      diagnosticoClinico: '', lesoesCirurgias: '', quaisLesoes: '', queixaDor: '', limitacaoAVD: '', terapiasAnteriores: '',
      quaisTerapias: '', usoMedicamentos: '', quaisMedicamentos: '', terapiasConcomitantes: '', quaisTerapiasConcomitantes: '',
      historicoFamiliar: '', familiarDoencas: '', quaisDoencasFamilia: ''
    })
  }

  const required = (v: unknown) => v !== '' && v !== undefined && v !== null

  return (
    <div className={`${styles.container} ${styles.root}`}>
      <div className={`${styles.header} ${styles.headerRow}`}>
        <img className={styles.logoLeft} src="/logo.png" alt="Logo" />
        <h1>Ficha de Avaliação</h1>
        <img className={styles.logoRight} src="/logoRafa.png" alt="Logo RC" /> 
      </div>
      <form
        className={styles.form}
        onSubmit={async e => { e.preventDefault(); await generateFichaPdf(ficha); }}
      >
        <div className={styles.field}>
          <label>Nome</label>
          <input value={ficha.nome} onChange={e => update('nome', e.target.value)} required />
        </div>

        <div className={styles.field}>
          <label>Idade</label>
          <input type="number" min={0} value={ficha.idade} onChange={e => update('idade', e.target.value ? Number(e.target.value) : '')} required />
        </div>

        <div className={styles.field}>
          <label>Sexo</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="sexo" checked={ficha.sexo==='M'} onChange={() => update('sexo','M')} /> M</label>
            <label><input type="radio" name="sexo" checked={ficha.sexo==='F'} onChange={() => update('sexo','F')} /> F</label>
          </div>
        </div>

        <div className={styles.field}>
          <label>Massa corporal (kg)</label>
          <input type="number" min={0} step="0.1" value={ficha.massaCorporal} onChange={e => update('massaCorporal', e.target.value ? Number(e.target.value) : '')} />
        </div>

        <div className={styles.field}>
          <label>Estatura (cm)</label>
          <input type="number" min={0} value={ficha.estatura} onChange={e => update('estatura', e.target.value ? Number(e.target.value) : '')} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Ocupação</label>
          <input value={ficha.ocupacao} onChange={e => update('ocupacao', e.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Objetivos</label>
          <textarea rows={3} value={ficha.objetivos} onChange={e => update('objetivos', e.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Hábitos de vida</label>
          <textarea rows={3} value={ficha.habitosDeVida} onChange={e => update('habitosDeVida', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Pratica algum exercício físico?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="exercicio" checked={ficha.praticaExercicio==='Não'} onChange={() => update('praticaExercicio','Não')} /> Não</label>
            <label><input type="radio" name="exercicio" checked={ficha.praticaExercicio==='Sim'} onChange={() => update('praticaExercicio','Sim')} /> Sim</label>
          </div>
        </div>
        {ficha.praticaExercicio==='Sim' && (
          <div className={styles.field}>
            <label>Qual?</label>
            <input value={ficha.qualExercicio || ''} onChange={e => update('qualExercicio', e.target.value)} />
          </div>
        )}

        <div className={styles.field}>
          <label>Qualidade do sono</label>
          <select value={ficha.qualidadeSono} onChange={e => update('qualidadeSono', e.target.value as Ficha['qualidadeSono'])}>
            <option value="">Selecione</option>
            <option value="ruim">Ruim</option>
            <option value="regular">Regular</option>
            <option value="bom">Bom</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Alimentação</label>
          <select value={ficha.alimentacao} onChange={e => update('alimentacao', e.target.value as Ficha['alimentacao'])}>
            <option value="">Selecione</option>
            <option value="ruim">Ruim</option>
            <option value="regular">Regular</option>
            <option value="bom">Bom</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Nível de estresse/cansaço</label>
          <select value={ficha.nivelEstresse} onChange={e => update('nivelEstresse', e.target.value as Ficha['nivelEstresse'])}>
            <option value="">Selecione</option>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </select>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>História médica pregressa e atual</label>
          <textarea rows={3} value={ficha.historiaMedica} onChange={e => update('historiaMedica', e.target.value)} />
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Diagnóstico clínico</label>
          <textarea rows={3} value={ficha.diagnosticoClinico} onChange={e => update('diagnosticoClinico', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Lesões ou cirurgias anteriores?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="lesoes" checked={ficha.lesoesCirurgias==='Não'} onChange={() => update('lesoesCirurgias','Não')} /> Não</label>
            <label><input type="radio" name="lesoes" checked={ficha.lesoesCirurgias==='Sim'} onChange={() => update('lesoesCirurgias','Sim')} /> Sim</label>
          </div>
        </div>
        {ficha.lesoesCirurgias==='Sim' && (
          <div className={styles.field}>
            <label>Qual(is)?</label>
            <input value={ficha.quaisLesoes || ''} onChange={e => update('quaisLesoes', e.target.value)} />
          </div>
        )}

        <div className={`${styles.field} ${styles.full}`}>
          <label>Queixa de dor</label>
          <textarea rows={2} value={ficha.queixaDor} onChange={e => update('queixaDor', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Nível de limitação para AVD's</label>
          <select value={ficha.limitacaoAVD} onChange={e => update('limitacaoAVD', e.target.value as Ficha['limitacaoAVD'])}>
            <option value="">Selecione</option>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
          </select>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Terapias anteriores?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="terapiasAnt" checked={ficha.terapiasAnteriores==='Não'} onChange={() => update('terapiasAnteriores','Não')} /> Não</label>
            <label><input type="radio" name="terapiasAnt" checked={ficha.terapiasAnteriores==='Sim'} onChange={() => update('terapiasAnteriores','Sim')} /> Sim</label>
            {ficha.terapiasAnteriores==='Sim' && (
              <label className={styles.inlineLabel}>Qual(is)?
                <input className={styles.inlineInput} value={ficha.quaisTerapias || ''} onChange={e => update('quaisTerapias', e.target.value)} />
              </label>
            )}
          </div>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Uso de medicamentos?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="meds" checked={ficha.usoMedicamentos==='Não'} onChange={() => update('usoMedicamentos','Não')} /> Não</label>
            <label><input type="radio" name="meds" checked={ficha.usoMedicamentos==='Sim'} onChange={() => update('usoMedicamentos','Sim')} /> Sim</label>
            {ficha.usoMedicamentos==='Sim' && (
              <label className={styles.inlineLabel}>Qual(is)?
                <input className={styles.inlineInput} value={ficha.quaisMedicamentos || ''} onChange={e => update('quaisMedicamentos', e.target.value)} />
              </label>
            )}
          </div>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Terapias Concomitantes?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="terapiasConc" checked={ficha.terapiasConcomitantes==='Não'} onChange={() => update('terapiasConcomitantes','Não')} /> Não</label>
            <label><input type="radio" name="terapiasConc" checked={ficha.terapiasConcomitantes==='Sim'} onChange={() => update('terapiasConcomitantes','Sim')} /> Sim</label>
            {ficha.terapiasConcomitantes==='Sim' && (
              <label className={styles.inlineLabel}>Qual(is)?
                <input className={styles.inlineInput} value={ficha.quaisTerapiasConcomitantes || ''} onChange={e => update('quaisTerapiasConcomitantes', e.target.value)} />
              </label>
            )}
          </div>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label>Histórico familiar</label>
          <textarea rows={3} value={ficha.historicoFamiliar} onChange={e => update('historicoFamiliar', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label>Você possui algum familiar com histórico de doença cardíaca, diabetes, pressão alta, colesterol alto ou outra alteração metabólica?</label>
          <div className={styles.radioRow}>
            <label><input type="radio" name="fam" checked={ficha.familiarDoencas==='Não'} onChange={() => update('familiarDoencas','Não')} /> Não</label>
            <label><input type="radio" name="fam" checked={ficha.familiarDoencas==='Sim'} onChange={() => update('familiarDoencas','Sim')} /> Sim</label>
          </div>
        </div>
        {ficha.familiarDoencas==='Sim' && (
          <div className={`${styles.field} ${styles.full}`}>
            <label>Qual(is)?</label>
            <input value={ficha.quaisDoencasFamilia || ''} onChange={e => update('quaisDoencasFamilia', e.target.value)} />
          </div>
        )}

        <div className={`${styles.actions} ${styles.full}`}>
          <button className={styles.btnBlue} type="submit">Enviar</button>
          <button className={styles.btnPink} type="button" onClick={reset}>Limpar</button>
        </div>
      </form>
    </div>
  )
}
