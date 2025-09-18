"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea
} from "@/components/ui";
import { Calendar, ClipboardList, Kanban, Layers, LineChart, Settings2, Upload } from "lucide-react";

import type { ChangeEvent, FormEvent } from "react";

type MatrixSpec = {
  code: string;
  shortCode: string;
  label: string;
  manufacturer: string;
  curing: string;
  carving: string;
  buffing: string;
};

type SpecCombination = {
  id: string;
  label: string;
  front: MatrixSpec;
  rear: MatrixSpec;
  quantity: number;
  purpose: string;
  notes?: string;
};

type TestOrderStatus = "planned" | "in-progress" | "completed" | "cancelled";

type TestOrder = {
  id: string;
  combinationId: string;
  objective: string;
  vehicle: string;
  schedule: string;
  quantity: number;
  status: TestOrderStatus;
};

type EvaluationSheet = {
  id: string;
  testOrderId: string;
  specCode: string;
  mCode: string;
  manufacturing: string;
  curing: string;
  carving: string;
  buffing: string;
};

type ResultRecord = {
  id: string;
  testOrderId: string;
  fileName: string;
  uploadedAt: string;
  status: "matched" | "pending" | "cancelled";
};

type SheetField = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
};

const frontMatrixOptions: MatrixSpec[] = [
  {
    code: "FR-A",
    shortCode: "A",
    label: "Front A (Baseline)",
    manufacturer: "금호 울산",
    curing: "170°C / 12min",
    carving: "Mold 7421",
    buffing: "0.3mm"
  },
  {
    code: "FR-B",
    shortCode: "B",
    label: "Front B (고하중)",
    manufacturer: "금호 곡성",
    curing: "168°C / 11min",
    carving: "Mold 7452",
    buffing: "0.5mm"
  },
  {
    code: "FR-C",
    shortCode: "C",
    label: "Front C (스노우)",
    manufacturer: "금호 광주",
    curing: "165°C / 10min",
    carving: "Mold 7511",
    buffing: "0.2mm"
  },
  {
    code: "FR-D",
    shortCode: "D",
    label: "Front D (EV)",
    manufacturer: "금호 평택",
    curing: "172°C / 13min",
    carving: "Mold 7602",
    buffing: "0.4mm"
  }
];

const rearMatrixOptions: MatrixSpec[] = [
  {
    code: "RR-a",
    shortCode: "a",
    label: "Rear a (Baseline)",
    manufacturer: "금호 울산",
    curing: "170°C / 12min",
    carving: "Mold 8431",
    buffing: "0.3mm"
  },
  {
    code: "RR-b",
    shortCode: "b",
    label: "Rear b (고하중)",
    manufacturer: "금호 곡성",
    curing: "169°C / 11min",
    carving: "Mold 8462",
    buffing: "0.6mm"
  },
  {
    code: "RR-c",
    shortCode: "c",
    label: "Rear c (스노우)",
    manufacturer: "금호 광주",
    curing: "166°C / 10min",
    carving: "Mold 8514",
    buffing: "0.2mm"
  },
  {
    code: "RR-d",
    shortCode: "d",
    label: "Rear d (EV)",
    manufacturer: "금호 평택",
    curing: "172°C / 13min",
    carving: "Mold 8622",
    buffing: "0.4mm"
  }
];

const initialCombinations: SpecCombination[] = [
  {
    id: "T1",
    label: "A-a",
    front: frontMatrixOptions[0],
    rear: rearMatrixOptions[0],
    quantity: 6,
    purpose: "기준 품질 검증",
    notes: "조합평가 기본 세트"
  },
  {
    id: "T2",
    label: "A-b",
    front: frontMatrixOptions[0],
    rear: rearMatrixOptions[1],
    quantity: 6,
    purpose: "고하중 내구",
    notes: "하중 변화 영향도"
  },
  {
    id: "T3",
    label: "B-b",
    front: frontMatrixOptions[1],
    rear: rearMatrixOptions[1],
    quantity: 4,
    purpose: "열화 프로파일",
    notes: "가류 조건 변경"
  }
];

const initialOrders: TestOrder[] = [
  {
    id: "ORD-001",
    combinationId: "T1",
    objective: "도심/고속 복합 주행 내구",
    vehicle: "모하비 3.0",
    schedule: "2024-11-04",
    quantity: 6,
    status: "in-progress"
  },
  {
    id: "ORD-002",
    combinationId: "T2",
    objective: "고하중 트레드 온도 비교",
    vehicle: "포터 EV",
    schedule: "2024-11-12",
    quantity: 6,
    status: "planned"
  },
  {
    id: "ORD-003",
    combinationId: "T3",
    objective: "가류 조건별 제동성",
    vehicle: "카니발 HEV",
    schedule: "2024-11-20",
    quantity: 4,
    status: "cancelled"
  }
];

const initialSheets: EvaluationSheet[] = [
  {
    id: "ES-01",
    testOrderId: "ORD-001",
    specCode: "A-a",
    mCode: "M-10452",
    manufacturing: "금호 울산 / 2024.10",
    curing: "170°C / 12min",
    carving: "7421",
    buffing: "0.3mm"
  },
  {
    id: "ES-02",
    testOrderId: "ORD-002",
    specCode: "A-b",
    mCode: "M-10453",
    manufacturing: "금호 곡성 / 2024.10",
    curing: "168°C / 11min",
    carving: "7452",
    buffing: "0.5mm"
  }
];

const initialResults: ResultRecord[] = [
  {
    id: "R-001",
    testOrderId: "ORD-001",
    fileName: "20241104_durability_set1.xlsx",
    uploadedAt: "2024-11-05 09:21",
    status: "matched"
  },
  {
    id: "R-002",
    testOrderId: "ORD-002",
    fileName: "20241112_highload_temp.csv",
    uploadedAt: "2024-11-13 14:02",
    status: "pending"
  }
];

const initialFields: SheetField[] = [
  {
    key: "mCode",
    label: "M-Code",
    description: "제조 로트 추적을 위한 필수값",
    enabled: true
  },
  {
    key: "manufacturing",
    label: "제조 정보",
    description: "공장/생산 주차 등",
    enabled: true
  },
  {
    key: "curing",
    label: "가류 조건",
    description: "온도/시간 기록",
    enabled: true
  },
  {
    key: "carving",
    label: "카빙",
    description: "몰드 식별 코드",
    enabled: true
  },
  {
    key: "buffing",
    label: "버핑",
    description: "버핑 적용 여부",
    enabled: false
  },
  {
    key: "remarks",
    label: "특이사항",
    description: "현장 특이사항 메모",
    enabled: true
  }
];

const STATUS_COPY: Record<TestOrderStatus, string> = {
  planned: "계획",
  "in-progress": "진행 중",
  completed: "완료",
  cancelled: "취소"
};

function statusVariant(status: TestOrderStatus) {
  switch (status) {
    case "planned":
      return "secondary" as const;
    case "in-progress":
      return "default" as const;
    case "completed":
      return "outline" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default function HomePage() {
  const [combinations, setCombinations] = useState(initialCombinations);
  const [testOrders, setTestOrders] = useState(initialOrders);
  const [sheets] = useState(initialSheets);
  const [sheetFields, setSheetFields] = useState(initialFields);
  const [results, setResults] = useState(initialResults);
  const [defaultSetCount, setDefaultSetCount] = useState(6);

  const [newCombination, setNewCombination] = useState({
    frontCode: frontMatrixOptions[0]?.code ?? "",
    rearCode: rearMatrixOptions[0]?.code ?? "",
    quantity: 4,
    purpose: "내구 기준 비교",
    notes: ""
  });

  const [newOrder, setNewOrder] = useState({
    combinationId: initialCombinations[0]?.id ?? "",
    schedule: "",
    vehicle: "",
    objective: "",
    quantity: 4
  });

  const progress = useMemo(() => {
    const total = testOrders.length || 1;
    const completed = testOrders.filter((order) => order.status === "completed").length;
    const inProgress = testOrders.filter((order) => order.status === "in-progress").length;
    return {
      total,
      completed,
      inProgress,
      planned: testOrders.filter((order) => order.status === "planned").length,
      cancelled: testOrders.filter((order) => order.status === "cancelled").length,
      completionRate: Math.round((completed / total) * 100)
    };
  }, [testOrders]);

  const handleCombinationChange = (
    field: "frontCode" | "rearCode" | "quantity" | "purpose" | "notes",
    value: string
  ) => {
    setNewCombination((prev) => ({
      ...prev,
      [field]: field === "quantity" ? Number(value) || 0 : value
    }));
  };

  const handleOrderChange = (
    field: "combinationId" | "schedule" | "vehicle" | "objective" | "quantity",
    value: string
  ) => {
    setNewOrder((prev) => ({
      ...prev,
      [field]: field === "quantity" ? Number(value) || 0 : value
    }));
  };

  const handleAddCombination = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const front = frontMatrixOptions.find((item) => item.code === newCombination.frontCode);
    const rear = rearMatrixOptions.find((item) => item.code === newCombination.rearCode);
    if (!front || !rear) {
      return;
    }

    const id = `T${String(combinations.length + 1).padStart(1, "0")}`;
    const label = `${front.shortCode}-${rear.shortCode}`;

    setCombinations((prev) => [
      ...prev,
      {
        id,
        label,
        front,
        rear,
        quantity: newCombination.quantity,
        purpose: newCombination.purpose,
        notes: newCombination.notes
      }
    ]);

    setNewCombination((prev) => ({
      ...prev,
      notes: "",
      purpose: "내구 기준 비교",
      quantity: 4
    }));
  };

  const handleAddOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newOrder.combinationId) {
      return;
    }
    const combination = combinations.find((item) => item.id === newOrder.combinationId);
    if (!combination) {
      return;
    }
    const id = `ORD-${String(testOrders.length + 1).padStart(3, "0")}`;
    setTestOrders((prev) => [
      ...prev,
      {
        id,
        combinationId: combination.id,
        objective: newOrder.objective || combination.purpose,
        vehicle: newOrder.vehicle || "미정",
        schedule: newOrder.schedule || "협의 중",
        quantity: newOrder.quantity,
        status: "planned"
      }
    ]);

    setNewOrder({
      combinationId: combination.id,
      schedule: "",
      vehicle: "",
      objective: "",
      quantity: 4
    });
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    setTestOrders((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const cloned = [...prev];
      const [moved] = cloned.splice(index, 1);
      cloned.splice(targetIndex, 0, moved);
      return cloned;
    });
  };

  const toggleCancellation = (id: string) => {
    setTestOrders((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "cancelled" ? "planned" : "cancelled"
            }
          : item
      )
    );
  };

  const handleFieldToggle = (key: string) => {
    setSheetFields((prev) =>
      prev.map((field) =>
        field.key === key
          ? {
              ...field,
              enabled: !field.enabled
            }
          : field
      )
    );
  };

  const handleResultUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const activeOrders = testOrders.filter((order) => order.status !== "cancelled");
    if (activeOrders.length === 0) return;

    const newRecords: ResultRecord[] = Array.from(files).map((file, index) => {
      const mappedOrder = activeOrders[index % activeOrders.length];
      return {
        id: `R-${String(results.length + index + 1).padStart(3, "0")}`,
        testOrderId: mappedOrder.id,
        fileName: file.name,
        uploadedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        status: mappedOrder.status === "completed" ? "matched" : "pending"
      };
    });

    setResults((prev) => [...newRecords, ...prev]);
    event.target.value = "";
  };

  const auditTrail = useMemo(() => {
    return testOrders
      .filter((order) => order.status === "cancelled")
      .map((order) => ({
        orderId: order.id,
        combination: combinations.find((combo) => combo.id === order.combinationId)?.label ?? "-",
        note: "취소됨 - 결과 집계 제외",
        timestamp: "2024-11-02 18:20"
      }));
  }, [testOrders, combinations]);

  const activeCombination = combinations.find((combo) => combo.id === newOrder.combinationId);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">EV 타이어 메타데이터 운영 대시보드</CardTitle>
              <CardDescription>
                실차시험 의뢰부터 결과 매핑까지 모든 메타데이터를 한눈에 관리합니다.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              2024년 11월 라운드
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">조합 수</span>
              <p className="text-3xl font-semibold">{combinations.length} Set</p>
              <p className="text-sm text-muted-foreground">
                Front/Rear 매트릭스 조합 기준 자동 생성
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">진행 현황</span>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-semibold">{progress.inProgress}</p>
                <Badge variant="secondary">{progress.completionRate}% 완료</Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>계획 {progress.planned}</span>
                <span>완료 {progress.completed}</span>
                <span className="text-destructive">취소 {progress.cancelled}</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">데이터 품질</span>
              <p className="text-3xl font-semibold">8 필드</p>
              <p className="text-sm text-muted-foreground">
                평가 시트 확장 필드 ({sheetFields.filter((field) => field.enabled).length}/
                {sheetFields.length}) 활성화
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 border-t border-dashed pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Spec Matrix 자동 명명 규칙: Front 대문자 / Rear 소문자
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              취소 이력은 Audit Log로 보존됩니다.
            </div>
          </CardFooter>
        </Card>
        <Card className="bg-gradient-to-br from-sky-100 via-white to-white shadow-inner">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <LineChart className="h-4 w-4 text-sky-600" />
              KPI 알림
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Spec 일치율</span>
              <Badge>99.2%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>결과 업로드 SLA</span>
              <Badge variant="secondary">+4h</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                취소된 Test Order는 자동으로 결과 집계에서 제외되며, 복구 시 ID 기반으로 재매핑됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="request" className="space-y-6">
        <TabsList>
          <TabsTrigger value="request">1. 의뢰 파트</TabsTrigger>
          <TabsTrigger value="evaluation">2. 평가 파트</TabsTrigger>
          <TabsTrigger value="result">3. 결과 입력</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Kanban className="h-5 w-5 text-sky-600" />
                  1-1. 시험용 Spec 정의
                </CardTitle>
                <CardDescription>
                  Front/Rear 매트릭스에서 Spec Code를 선택해 조합을 정의하고 확장 필드를 기록합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddCombination} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="frontCode">Front Spec</Label>
                    <Select
                      id="frontCode"
                      value={newCombination.frontCode}
                      onChange={(event) => handleCombinationChange("frontCode", event.target.value)}
                    >
                      {frontMatrixOptions.map((spec) => (
                        <option key={spec.code} value={spec.code}>
                          {spec.shortCode} · {spec.label}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      제조: {frontMatrixOptions.find((spec) => spec.code === newCombination.frontCode)?.manufacturer}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rearCode">Rear Spec</Label>
                    <Select
                      id="rearCode"
                      value={newCombination.rearCode}
                      onChange={(event) => handleCombinationChange("rearCode", event.target.value)}
                    >
                      {rearMatrixOptions.map((spec) => (
                        <option key={spec.code} value={spec.code}>
                          {spec.shortCode} · {spec.label}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      제조: {rearMatrixOptions.find((spec) => spec.code === newCombination.rearCode)?.manufacturer}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comboQuantity">필요 수량 (Set)</Label>
                    <Input
                      id="comboQuantity"
                      type="number"
                      min={0}
                      value={newCombination.quantity}
                      onChange={(event) => handleCombinationChange("quantity", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comboPurpose">평가 목적</Label>
                    <Input
                      id="comboPurpose"
                      value={newCombination.purpose}
                      onChange={(event) => handleCombinationChange("purpose", event.target.value)}
                      placeholder="예: 전비 개선 비교"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="comboNotes">세부 조건</Label>
                    <Textarea
                      id="comboNotes"
                      value={newCombination.notes}
                      onChange={(event) => handleCombinationChange("notes", event.target.value)}
                      placeholder="제조, 가류, 카빙, 버핑 등 특이사항"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      동일 Spec의 중복 선택을 허용하여 다양한 Test Order에서 재사용할 수 있습니다.
                    </p>
                    <Button type="submit">조합 추가</Button>
                  </div>
                </form>

                <div className="rounded-lg border border-dashed p-4">
                  <h4 className="mb-3 text-sm font-semibold">등록된 Spec 조합</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {combinations.map((combination) => (
                      <div key={combination.id} className="rounded-md border bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge>{combination.label}</Badge>
                            <span className="text-sm font-medium">{combination.purpose}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{combination.quantity} set</span>
                        </div>
                        <dl className="mt-3 grid gap-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <dt>Front</dt>
                            <dd>
                              {combination.front.label} · {combination.front.curing}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Rear</dt>
                            <dd>
                              {combination.rear.label} · {combination.rear.curing}
                            </dd>
                          </div>
                          {combination.notes ? (
                            <div className="flex justify-between">
                              <dt>Notes</dt>
                              <dd className="max-w-[200px] text-right">{combination.notes}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Kanban className="h-5 w-5 text-sky-600" />
                  1-2. Test Order 구성
                </CardTitle>
                <CardDescription>
                  Front/Rear 조합으로 생성된 Test Order 리스트를 관리하고 순서를 조정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddOrder} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="orderCombination">Spec 조합</Label>
                    <Select
                      id="orderCombination"
                      value={newOrder.combinationId}
                      onChange={(event) => handleOrderChange("combinationId", event.target.value)}
                    >
                      {combinations.map((combination) => (
                        <option key={combination.id} value={combination.id}>
                          {combination.label} · {combination.purpose}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orderSchedule">예상 일정</Label>
                      <Input
                        id="orderSchedule"
                        type="date"
                        value={newOrder.schedule}
                        onChange={(event) => handleOrderChange("schedule", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orderVehicle">시험 차량</Label>
                      <Input
                        id="orderVehicle"
                        value={newOrder.vehicle}
                        placeholder="예: EV6 GT"
                        onChange={(event) => handleOrderChange("vehicle", event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderObjective">평가 목적</Label>
                    <Input
                      id="orderObjective"
                      value={newOrder.objective}
                      placeholder={activeCombination?.purpose ?? "평가 목적"}
                      onChange={(event) => handleOrderChange("objective", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderQuantity">필요 수량</Label>
                    <Input
                      id="orderQuantity"
                      type="number"
                      min={0}
                      value={newOrder.quantity}
                      onChange={(event) => handleOrderChange("quantity", event.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Test Order 추가
                  </Button>
                </form>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[110px]">Order</TableHead>
                        <TableHead>조합</TableHead>
                        <TableHead>일정</TableHead>
                        <TableHead>차량</TableHead>
                        <TableHead className="text-center">수량</TableHead>
                        <TableHead className="text-center">상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testOrders.map((order, index) => {
                        const combination = combinations.find((combo) => combo.id === order.combinationId);
                        return (
                          <TableRow key={order.id} className={order.status === "cancelled" ? "opacity-60" : undefined}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{combination?.label}</span>
                                <span className="text-xs text-muted-foreground">{order.objective}</span>
                              </div>
                            </TableCell>
                            <TableCell>{order.schedule}</TableCell>
                            <TableCell>{order.vehicle}</TableCell>
                            <TableCell className="text-center">{order.quantity}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={statusVariant(order.status)}>{STATUS_COPY[order.status]}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReorder(order.id, "up")}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReorder(order.id, "down")}
                                  disabled={index === testOrders.length - 1}
                                >
                                  ↓
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCancellation(order.id)}
                                >
                                  {order.status === "cancelled" ? "복구" : "취소"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <TableCaption>
                    Drag & Drop 없이도 순서를 미세 조정할 수 있으며, 취소된 Order는 Test Order ID로 관리됩니다.
                  </TableCaption>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Kanban className="h-5 w-5 text-sky-600" />
                1-3. 의뢰서 미리보기
              </CardTitle>
              <CardDescription>
                생성된 Test Order를 기반으로 의뢰서 요약본을 확인하고 PDF/Excel 출력 템플릿으로 전달합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-muted-foreground">프로젝트</p>
                  <p className="font-semibold">EV 전비 개선 4차</p>
                  <p className="text-xs text-muted-foreground">요청자: Vehicle Dev. / 김태윤</p>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-muted-foreground">평가 기간</p>
                  <p className="font-semibold">2024.11.04 ~ 2024.12.02</p>
                  <p className="text-xs text-muted-foreground">Test Order 순서에 따라 자동 캘린더화</p>
                </div>
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase text-muted-foreground">출력 옵션</p>
                  <p className="font-semibold">PDF, Excel</p>
                  <p className="text-xs text-muted-foreground">Spec Code & Test Order ID 포함</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Test Order</TableHead>
                      <TableHead>Spec Code</TableHead>
                      <TableHead>평가 목적</TableHead>
                      <TableHead>필요 수량</TableHead>
                      <TableHead>비고</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testOrders.map((order) => {
                      const combination = combinations.find((combo) => combo.id === order.combinationId);
                      return (
                        <TableRow key={`preview-${order.id}`} className={order.status === "cancelled" ? "opacity-60" : undefined}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge>{combination?.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {combination?.front.shortCode}/{combination?.rear.shortCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{order.objective}</TableCell>
                          <TableCell>{order.quantity} set</TableCell>
                          <TableCell>{order.status === "cancelled" ? "취소" : ""}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings2 className="h-5 w-5 text-sky-600" />
                  2-1. 평가 시트 관리
                </CardTitle>
                <CardDescription>
                  Spec 식별 필드를 추가하고 Test Order와 자동 연결되도록 구성합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed p-4">
                  <h4 className="mb-2 text-sm font-semibold">확장 필드 선택</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    {sheetFields.map((field) => (
                      <label key={field.key} className="flex items-start gap-2 rounded-md border bg-white p-3">
                        <Checkbox
                          checked={field.enabled}
                          onChange={() => handleFieldToggle(field.key)}
                        />
                        <div>
                          <p className="font-medium text-sm">{field.label}</p>
                          <p className="text-xs text-muted-foreground">{field.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sheet ID</TableHead>
                        <TableHead>Test Order</TableHead>
                        <TableHead>Spec Code</TableHead>
                        <TableHead>M-Code</TableHead>
                        <TableHead>제조</TableHead>
                        <TableHead>가류</TableHead>
                        <TableHead>카빙</TableHead>
                        <TableHead>버핑</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheets.map((sheet) => {
                        const order = testOrders.find((item) => item.id === sheet.testOrderId);
                        return (
                          <TableRow key={sheet.id}>
                            <TableCell>{sheet.id}</TableCell>
                            <TableCell>{order?.id}</TableCell>
                            <TableCell>{sheet.specCode}</TableCell>
                            <TableCell>{sheet.mCode}</TableCell>
                            <TableCell>{sheet.manufacturing}</TableCell>
                            <TableCell>{sheet.curing}</TableCell>
                            <TableCell>{sheet.carving}</TableCell>
                            <TableCell>{sheet.buffing}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings2 className="h-5 w-5 text-sky-600" />
                  2-2. Parsing & Set 수량
                </CardTitle>
                <CardDescription>
                  기본 입력 Set 수를 관리하고 확장 요구사항을 기록합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="defaultSet">기본 입력 Set 수</Label>
                  <Input
                    id="defaultSet"
                    type="number"
                    min={1}
                    max={24}
                    value={defaultSetCount}
                    onChange={(event) =>
                      setDefaultSetCount((prev) => Number(event.target.value) || prev)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    현재 워크플로는 8 Set까지 지원하며 필요 시 확장 가능합니다.
                  </p>
                </div>

                <div className="rounded-lg border border-dashed p-4">
                  <h4 className="mb-2 text-sm font-semibold">파싱 구조 메모</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>· Test Order ID + Spec Code의 조합으로 Row 매칭</li>
                    <li>· 단일 워크북 내 복수 워크시트 지원 (Sheet 이름 = Test Order ID)</li>
                    <li>· 취소된 Order는 상태 필드 기반으로 Skip 처리</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <h4 className="mb-2 text-sm font-semibold">확장 요구사항</h4>
                  <p className="text-xs text-muted-foreground">
                    8 Set 초과 입력이 필요한 경우, 추가 워크시트를 자동 생성하고 매핑 키는 UUID 기반으로 발급합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="result" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-sky-600" />
                  3-1. 결과 파일 업로드
                </CardTitle>
                <CardDescription>
                  다중 파일 업로드를 지원하며, 단일 워크북의 복수 워크시트도 자동 인식합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-white p-6 text-sm text-muted-foreground">
                  <Upload className="h-10 w-10 text-sky-500" />
                  <span>파일을 드롭하거나 클릭하여 업로드</span>
                  <Input type="file" multiple className="hidden" onChange={handleResultUpload} />
                  <span className="text-xs">지원 포맷: XLSX, CSV, ZIP</span>
                </label>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">업로드 ID</TableHead>
                        <TableHead>Test Order</TableHead>
                        <TableHead>파일명</TableHead>
                        <TableHead>업로드 시각</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>{result.id}</TableCell>
                          <TableCell>{result.testOrderId}</TableCell>
                          <TableCell>{result.fileName}</TableCell>
                          <TableCell>{result.uploadedAt}</TableCell>
                          <TableCell>
                            <Badge variant={result.status === "matched" ? "default" : result.status === "pending" ? "secondary" : "destructive"}>
                              {result.status === "matched"
                                ? "매핑 완료"
                                : result.status === "pending"
                                ? "매핑 대기"
                                : "취소"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TableCaption>
                    Test Order ID 기반으로 자동 매핑되며, 취소된 Order는 상태에 따라 제외됩니다.
                  </TableCaption>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-sky-600" />
                  3-2. 매핑 로직 & 취소 처리
                </CardTitle>
                <CardDescription>
                  Test Order 재배치, 취소에도 불일치가 발생하지 않도록 매핑 전략을 점검합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-dashed p-4">
                  <h4 className="mb-2 text-sm font-semibold">매핑 체크리스트</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>· Test Order ID = 워크시트 명 (우선)</li>
                    <li>· Spec Code 보조 키로 검증</li>
                    <li>· 취소 상태는 Audit Log에 기록</li>
                  </ul>
                </div>

                <div className="rounded-lg border bg-white p-4">
                  <h4 className="mb-2 text-sm font-semibold">취소 이력</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {auditTrail.length === 0 ? (
                      <li>최근 취소된 Test Order가 없습니다.</li>
                    ) : (
                      auditTrail.map((item) => (
                        <li key={item.orderId} className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{item.orderId}</p>
                            <p>{item.combination}</p>
                          </div>
                          <div className="text-right">
                            <p>{item.timestamp}</p>
                            <p>{item.note}</p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">매핑 규칙</p>
                  <p className="mt-2">
                    Test Order가 중간에서 취소되더라도 고유 ID로 결과를 연결하여 순서 변경에 영향을 받지 않습니다. 취소 복구 시 Audit Log를 통해 이력이 남습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
