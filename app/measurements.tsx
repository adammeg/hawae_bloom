import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, DecorativeBackdrop, Eyebrow, LoadingView, Page } from "@/components/ui";
import { exportFollowUpPdf } from "@/src/lib/pdf-export";
import { useAuth } from "@/src/state/auth-context";
import { useCycle } from "@/src/state/cycle-context";
import { usePatientData } from "@/src/state/patient-data-context";
import { colors } from "@/src/theme/colors";
import type { Measurement } from "@/src/types/patient";

type NumericField = keyof Pick<Measurement, "weightKg" | "systolic" | "diastolic" | "glucoseMgDl" | "lhMiUml" | "fshMiUml" | "progesteroneNgMl" | "estradiolPgMl" | "prolactinNgMl">;
type GlucoseTiming = NonNullable<Measurement["glucoseTiming"]>;

const GLUCOSE_TIMINGS: Array<{ value: GlucoseTiming; label: string }> = [
  { value: "fasting", label: "À jeun" },
  { value: "1h", label: "1 h après repas" },
  { value: "2h", label: "2 h après repas" },
  { value: "other", label: "Autre" },
];

const HORMONES: Array<{ key: NumericField; label: string; unit: string; color: string }> = [
  { key: "lhMiUml", label: "LH", unit: "mUI/mL", color: colors.teal },
  { key: "fshMiUml", label: "FSH", unit: "mUI/mL", color: colors.roseDeep },
  { key: "progesteroneNgMl", label: "Progestérone", unit: "ng/mL", color: colors.gold },
  { key: "estradiolPgMl", label: "Œstradiol (E2)", unit: "pg/mL", color: colors.rose },
  { key: "prolactinNgMl", label: "Prolactinémie", unit: "ng/mL", color: colors.plum },
];

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  return Number(value.replace(",", "."));
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export default function MeasurementsScreen() {
  const auth = useAuth();
  const { settings } = useCycle();
  const { data, addMeasurement } = usePatientData();
  const [values, setValues] = useState<Record<NumericField, string>>({
    weightKg: "", systolic: "", diastolic: "", glucoseMgDl: "", lhMiUml: "", fshMiUml: "",
    progesteroneNgMl: "", estradiolPgMl: "", prolactinNgMl: "",
  });
  const [glucoseTiming, setGlucoseTiming] = useState<GlucoseTiming>("fasting");
  const isPregnancy = settings.careMode === "pregnancy";
  const showHormones = settings.careMode === "cycle" || settings.careMode === "pma";

  if (!auth.hydrated) return <LoadingView />;
  if (!auth.user) return <Redirect href="/auth" />;

  const setField = (field: NumericField) => (value: string) => setValues((current) => ({ ...current, [field]: value }));

  function save() {
    const parsed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseNumber(value)])) as Record<NumericField, number | undefined>;
    const hasPressure = parsed.systolic !== undefined || parsed.diastolic !== undefined;
    const pressureInvalid = hasPressure && (
      parsed.systolic === undefined || parsed.diastolic === undefined ||
      !Number.isFinite(parsed.systolic) || !Number.isFinite(parsed.diastolic) ||
      parsed.systolic < 60 || parsed.systolic > 260 || parsed.diastolic < 30 || parsed.diastolic > 160 || parsed.systolic <= parsed.diastolic
    );
    const visibleSpecificValues = isPregnancy
      ? [parsed.glucoseMgDl]
      : showHormones
        ? HORMONES.map((hormone) => parsed[hormone.key])
        : [];
    const hasAnyValue = [parsed.weightKg, parsed.systolic, parsed.diastolic, ...visibleSpecificValues].some((value) => value !== undefined);
    const invalidGeneral = parsed.weightKg !== undefined && (!Number.isFinite(parsed.weightKg) || parsed.weightKg < 30 || parsed.weightKg > 250);
    const invalidGlucose = parsed.glucoseMgDl !== undefined && (!Number.isFinite(parsed.glucoseMgDl) || parsed.glucoseMgDl < 20 || parsed.glucoseMgDl > 600);
    const invalidHormone = HORMONES.some(({ key }) => parsed[key] !== undefined && (!Number.isFinite(parsed[key]) || parsed[key]! < 0 || parsed[key]! > 100000));

    if (!hasAnyValue || pressureInvalid || invalidGeneral || invalidGlucose || invalidHormone) {
      Alert.alert("Mesure invalide", "Ajoutez au moins une valeur numérique cohérente. La tension nécessite les deux valeurs.");
      return;
    }

    addMeasurement({
      weightKg: parsed.weightKg,
      systolic: parsed.systolic,
      diastolic: parsed.diastolic,
      glucoseMgDl: isPregnancy ? parsed.glucoseMgDl : undefined,
      glucoseTiming: isPregnancy && parsed.glucoseMgDl !== undefined ? glucoseTiming : undefined,
      lhMiUml: showHormones ? parsed.lhMiUml : undefined,
      fshMiUml: showHormones ? parsed.fshMiUml : undefined,
      progesteroneNgMl: showHormones ? parsed.progesteroneNgMl : undefined,
      estradiolPgMl: showHormones ? parsed.estradiolPgMl : undefined,
      prolactinNgMl: showHormones ? parsed.prolactinNgMl : undefined,
    });
    setValues((current) => Object.fromEntries(Object.keys(current).map((key) => [key, ""])) as Record<NumericField, string>);
  }

  return (
    <Page><DecorativeBackdrop /><SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.topbar}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.teal} /></Pressable>
        <Pressable onPress={() => void exportFollowUpPdf(settings, data)} style={styles.export}><Ionicons name="download-outline" size={17} color={colors.teal} /><Text style={styles.exportText}>PDF</Text></Pressable>
      </View>
      <Eyebrow>MES MESURES</Eyebrow><Text style={styles.title}>Vos courbes,{`\n`}en un <Text style={styles.accent}>coup d’œil.</Text></Text>

      <Card style={styles.form}>
        <Text style={styles.formTitle}>Ajouter une mesure</Text>
        <Text style={styles.groupTitle}>MESURES GÉNÉRALES</Text>
        <View style={styles.inputs}>
          <MeasureInput label="Poids" unit="kg" value={values.weightKg} onChange={setField("weightKg")} />
          <MeasureInput label="Systolique" unit="mmHg" value={values.systolic} onChange={setField("systolic")} />
          <MeasureInput label="Diastolique" unit="mmHg" value={values.diastolic} onChange={setField("diastolic")} />
        </View>

        {isPregnancy ? <>
          <Text style={styles.groupTitle}>GLYCÉMIE · GROSSESSE</Text>
          <MeasureInput label="Glycémie capillaire" unit="mg/dL" value={values.glucoseMgDl} onChange={setField("glucoseMgDl")} />
          <Text style={styles.contextLabel}>Contexte du prélèvement</Text>
          <View style={styles.chips}>{GLUCOSE_TIMINGS.map((timing) => <Pressable key={timing.value} onPress={() => setGlucoseTiming(timing.value)} style={[styles.chip, glucoseTiming === timing.value && styles.chipActive]}><Text style={[styles.chipText, glucoseTiming === timing.value && styles.chipTextActive]}>{timing.label}</Text></Pressable>)}</View>
        </> : null}

        {showHormones ? <>
          <Text style={styles.groupTitle}>BILAN HORMONAL · {settings.careMode === "pma" ? "PMA" : "GYNÉCOLOGIE"}</Text>
          <View style={styles.hormoneInputs}>{HORMONES.map((hormone) => <MeasureInput key={hormone.key} label={hormone.label} unit={hormone.unit} value={values[hormone.key]} onChange={setField(hormone.key)} />)}</View>
          <Text style={styles.formHint}>Saisissez les valeurs et unités telles qu’indiquées par le laboratoire.</Text>
        </> : null}

        <Pressable onPress={save} style={styles.save}><Text style={styles.saveText}>Enregistrer</Text></Pressable>
      </Card>

      <Text style={styles.sectionLabel}>ÉVOLUTION DU POIDS</Text><Card><MetricChart values={metricValues(data.measurements, "weightKg")} color={colors.roseDeep} suffix=" kg" /></Card>
      <Text style={styles.sectionLabel}>TENSION ARTÉRIELLE</Text><Card><BloodPressureChart values={data.measurements.filter((item) => item.systolic !== undefined && item.diastolic !== undefined).map((item) => ({ systolic: item.systolic!, diastolic: item.diastolic!, measuredAt: item.measuredAt }))} /><Text style={styles.chartHint}>Systolique et diastolique · à interpréter selon le contexte clinique.</Text></Card>

      {isPregnancy ? <>
        <Text style={styles.sectionLabel}>GLYCÉMIE · GROSSESSE</Text>
        <Card><GlucoseChart measurements={data.measurements} /></Card>
      </> : null}

      {showHormones ? <>
        <Text style={styles.sectionLabel}>COURBES HORMONALES · {settings.careMode === "pma" ? "PMA" : "GYNÉCOLOGIE"}</Text>
        {HORMONES.map((hormone) => <Card key={hormone.key} style={styles.metricCard}><Text style={styles.metricTitle}>{hormone.label} <Text style={styles.metricUnit}>({hormone.unit})</Text></Text><MetricChart values={metricValues(data.measurements, hormone.key)} color={hormone.color} suffix={` ${hormone.unit}`} /></Card>)}
      </> : null}

      <Text style={styles.sectionLabel}>HISTORIQUE</Text>
      {[...data.measurements].reverse().map((item) => <MeasurementRow key={item.id} item={item} />)}
    </ScrollView></SafeAreaView></Page>
  );
}

function metricValues(measurements: Measurement[], key: NumericField): Array<{ value: number; measuredAt: string }> {
  return measurements.flatMap((item) => typeof item[key] === "number" ? [{ value: item[key] as number, measuredAt: item.measuredAt }] : []);
}

function glucoseTimingLabel(value?: Measurement["glucoseTiming"]): string {
  return GLUCOSE_TIMINGS.find((item) => item.value === value)?.label ?? "Contexte non renseigné";
}

function MeasureInput({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.inputBlock}><Text style={styles.inputLabel}>{label}</Text><View style={styles.inputWrap}><TextInput value={value} onChangeText={onChange} keyboardType="decimal-pad" placeholder="—" placeholderTextColor={colors.muted} style={styles.input} /><Text style={styles.unit}>{unit}</Text></View></View>;
}

function MetricChart({ values, color, suffix }: { values: Array<{ value: number; measuredAt: string }>; color: string; suffix: string }) {
  const visible = values.slice(-7);
  const min = visible.length ? Math.min(...visible.map((item) => item.value)) : 0;
  const max = visible.length ? Math.max(...visible.map((item) => item.value)) : 1;
  return <View>{visible.length ? <><View style={styles.chart}>{visible.map((item, index) => { const height = 28 + ((item.value - min) / Math.max(0.01, max - min)) * 70; return <View key={`${item.measuredAt}-${index}`} style={styles.barColumn}><Text style={styles.barValue}>{formatNumber(item.value)}</Text><View style={[styles.bar, { height, backgroundColor: color }]} /><Text style={styles.barDate}>{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(new Date(item.measuredAt))}</Text></View>; })}</View><Text style={styles.latest}>Dernière valeur : {formatNumber(visible[visible.length - 1]!.value)}{suffix}</Text></> : <Text style={styles.empty}>Aucune mesure</Text>}</View>;
}

function GlucoseChart({ measurements }: { measurements: Measurement[] }) {
  const visible = measurements.filter((item) => item.glucoseMgDl !== undefined).slice(-7);
  const values = visible.map((item) => item.glucoseMgDl!);
  const max = values.length ? Math.max(...values, 140) : 140;
  return <View>{visible.length ? <><View style={styles.chart}>{visible.map((item) => <View key={item.id} style={styles.barColumn}><Text style={styles.barValue}>{formatNumber(item.glucoseMgDl!)}</Text><View style={[styles.bar, { height: 28 + item.glucoseMgDl! / max * 70, backgroundColor: item.glucoseTiming === "fasting" ? colors.teal : colors.roseDeep }]} /><Text style={styles.glucoseContext}>{item.glucoseTiming === "fasting" ? "À jeun" : item.glucoseTiming === "1h" ? "1 h" : item.glucoseTiming === "2h" ? "2 h" : "Autre"}</Text></View>)}</View><Text style={styles.latest}>Dernière valeur : {formatNumber(visible[visible.length - 1]!.glucoseMgDl!)} mg/dL · {glucoseTimingLabel(visible[visible.length - 1]!.glucoseTiming)}</Text></> : <Text style={styles.empty}>Aucune glycémie enregistrée</Text>}</View>;
}

function BloodPressureChart({ values }: { values: Array<{ systolic: number; diastolic: number; measuredAt: string }> }) {
  const visible = values.slice(-7);
  const scale = (value: number) => 22 + (Math.max(30, Math.min(260, value)) - 30) / 230 * 82;
  return <View>{visible.length ? <><View style={styles.bpLegend}><View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.teal }]} /><Text style={styles.legendText}>Systolique</Text></View><View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.rose }]} /><Text style={styles.legendText}>Diastolique</Text></View></View><View style={styles.chart}>{visible.map((item) => <View key={item.measuredAt} style={styles.bpColumn}><Text style={styles.bpValue}>{item.systolic}/{item.diastolic}</Text><View style={styles.bpBars}><View style={[styles.bpBar, { height: scale(item.systolic), backgroundColor: colors.teal }]} /><View style={[styles.bpBar, { height: scale(item.diastolic), backgroundColor: colors.rose }]} /></View><Text style={styles.bpDate}>{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(new Date(item.measuredAt))}</Text></View>)}</View><Text style={styles.latest}>Dernière tension : {visible[visible.length - 1]!.systolic}/{visible[visible.length - 1]!.diastolic} mmHg</Text></> : <Text style={styles.empty}>Aucune tension complète</Text>}</View>;
}

function MeasurementRow({ item }: { item: Measurement }) {
  const details: string[] = [];
  if (item.weightKg !== undefined) details.push(`${formatNumber(item.weightKg)} kg`);
  if (item.systolic !== undefined && item.diastolic !== undefined) details.push(`${item.systolic}/${item.diastolic} mmHg`);
  if (item.glucoseMgDl !== undefined) details.push(`Glycémie ${formatNumber(item.glucoseMgDl)} mg/dL (${glucoseTimingLabel(item.glucoseTiming)})`);
  HORMONES.forEach((hormone) => { const value = item[hormone.key]; if (typeof value === "number") details.push(`${hormone.label} ${formatNumber(value)} ${hormone.unit}`); });
  return <Card style={styles.row}><View style={styles.rowIcon}><Ionicons name="analytics-outline" size={19} color={colors.roseDeep} /></View><View style={styles.rowCopy}><Text style={styles.rowDate}>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(item.measuredAt))}</Text><Text style={styles.rowValue}>{details.join(" · ") || "Aucune valeur"}</Text></View></Card>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, content: { padding: 20, paddingBottom: 36 }, topbar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  export: { height: 40, paddingHorizontal: 13, borderRadius: 14, backgroundColor: colors.tealMist, flexDirection: "row", alignItems: "center", gap: 6 }, exportText: { color: colors.teal, fontSize: 10, fontWeight: "900" },
  title: { marginTop: 8, color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: "900" }, accent: { color: colors.roseDeep }, form: { marginTop: 19 }, formTitle: { color: colors.ink, fontSize: 14, fontWeight: "900" },
  groupTitle: { marginTop: 17, marginBottom: 7, color: colors.teal, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, inputs: { flexDirection: "row", gap: 8 }, hormoneInputs: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  inputBlock: { flexGrow: 1, flexBasis: 95 }, inputLabel: { color: colors.muted, fontSize: 8, fontWeight: "800" }, inputWrap: { marginTop: 5, height: 45, paddingHorizontal: 9, borderRadius: 12, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, minWidth: 36, color: colors.ink, fontSize: 13, fontWeight: "900" }, unit: { color: colors.muted, fontSize: 7 }, contextLabel: { marginTop: 10, color: colors.muted, fontSize: 8, fontWeight: "800" },
  chips: { marginTop: 7, flexDirection: "row", flexWrap: "wrap", gap: 6 }, chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border }, chipActive: { backgroundColor: colors.teal, borderColor: colors.teal }, chipText: { color: colors.inkSoft, fontSize: 8, fontWeight: "800" }, chipTextActive: { color: colors.paper },
  formHint: { marginTop: 8, color: colors.muted, fontSize: 8, lineHeight: 12 }, save: { marginTop: 15, minHeight: 44, borderRadius: 13, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" }, saveText: { color: colors.paper, fontSize: 11, fontWeight: "900" },
  sectionLabel: { marginTop: 22, marginBottom: 9, color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, metricCard: { marginBottom: 9 }, metricTitle: { marginBottom: 7, color: colors.ink, fontSize: 11, fontWeight: "900" }, metricUnit: { color: colors.muted, fontSize: 8 },
  chart: { height: 128, flexDirection: "row", alignItems: "flex-end", gap: 7 }, barColumn: { flex: 1, height: 125, alignItems: "center", justifyContent: "flex-end" }, bar: { width: "75%", minHeight: 12, borderRadius: 8 }, barValue: { marginBottom: 4, color: colors.inkSoft, fontSize: 7, fontWeight: "800" }, barDate: { marginTop: 3, color: colors.muted, fontSize: 6 }, glucoseContext: { marginTop: 3, color: colors.muted, fontSize: 6, fontWeight: "800" }, latest: { marginTop: 9, color: colors.ink, fontSize: 10, fontWeight: "900" },
  chartHint: { marginTop: 8, color: colors.muted, fontSize: 8, lineHeight: 12 }, bpLegend: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 7 }, legendItem: { flexDirection: "row", alignItems: "center", gap: 5 }, legendDot: { width: 8, height: 8, borderRadius: 4 }, legendText: { color: colors.inkSoft, fontSize: 8, fontWeight: "800" }, bpColumn: { flex: 1, height: 125, alignItems: "center", justifyContent: "flex-end" }, bpValue: { color: colors.inkSoft, fontSize: 7, fontWeight: "900", marginBottom: 3 }, bpBars: { height: 91, flexDirection: "row", alignItems: "flex-end", gap: 2 }, bpBar: { width: 8, minHeight: 10, borderRadius: 4 }, bpDate: { marginTop: 3, color: colors.muted, fontSize: 6 },
  row: { marginBottom: 8, flexDirection: "row", alignItems: "flex-start" }, rowIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: colors.roseSoft, alignItems: "center", justifyContent: "center" }, rowCopy: { flex: 1, marginLeft: 10 }, rowDate: { color: colors.ink, fontSize: 10, fontWeight: "900" }, rowValue: { marginTop: 3, color: colors.muted, fontSize: 9, lineHeight: 14 }, empty: { color: colors.muted, fontSize: 10 },
});
