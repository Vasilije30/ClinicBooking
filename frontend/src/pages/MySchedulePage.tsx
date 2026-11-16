import { useEffect, useState } from "react";
import { deleteWorkSchedule, getMySchedule, saveWorkSchedule } from "../api";
import type { WorkSchedule } from "../types";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const NAMES: Record<number, string> = {
    1: "Ponedeljak",
    2: "Utorak",
    3: "Sreda",
    4: "Cetvrtak",
    5: "Petak",
    6: "Subota",
    0: "Nedelja",
};

interface BreakState {
    start: string;
    end : string;
}

interface DayState {
    dayOfWeek: number;
    id: string | null;
    enabled : boolean;
    start: string;
    end: string;
    breaks: BreakState[];
    message: string | null;
    error: string | null;
    saving: boolean;
}

const emptyDay = (dayOfWeek: number): DayState => ({
  dayOfWeek,
  id: null,
  enabled: false,
  start: "08:00",
  end: "15:00",
  breaks: [],
  message: null,
  error: null,
  saving: false,
});

const fromSchedule = (s: WorkSchedule): DayState => ({
    dayOfWeek: s.dayOfWeek,
    id: s.id,
    enabled: true,
    start: s.startTime.slice(0, 5),
    end: s.endTime.slice(0, 5),
    breaks: s.breaks.map((b) => ({
        start: b.startTime.slice(0, 5),
        end: b.endTime.slice(0, 5),
    })),
    message: null,
    error: null,
    saving: false,
});

export default function MySchedulePage() {
    const [days, setDays] = useState<DayState[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
    getMySchedule()
      .then((items) =>
        setDays(
          ORDER.map((d) => {
            const found = items.find((i) => i.dayOfWeek === d);
            return found ? fromSchedule(found) : emptyDay(d);
          })
        )
      )
      .catch((e: Error) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);


    function updateDay(dayOfWeek: number, patch: Partial<DayState>) {
        setDays((prev) => 
            prev.map((d) => (d.dayOfWeek === dayOfWeek ? {...d, ...patch} : d))
        );
    }
    
    function addBreak(day: DayState) {
        updateDay(day.dayOfWeek, {
            breaks: [...day.breaks, {start: "11:00", end: "11:30"}],
            message: null,
        });
    }
    function removeBreak(day: DayState, index: number) {
        updateDay(day.dayOfWeek, {
            breaks: day.breaks.filter((_, i) => i !== index),
            message: null,
        });
    }

    function updateBreak(day: DayState, index: number, field: "start" | "end", value: string) {
        updateDay(day.dayOfWeek, {
            breaks: day.breaks.map((b, i) => (i === index ? {...b, [field]: value} : b)),
            message: null,
        });
    }

    async function handleSave(day: DayState) {
        const key = day.dayOfWeek;

        if(day.enabled && (!day.start || !day.end || day.breaks.some((b) => !b.start || !b.end))) {
            updateDay(key, {error: "Popunite sva vremena.", message: null});
            return;
        }
        updateDay(key, {saving: true, error: null, message: null});
        try{
            if(!day.enabled) {
                if(day.id){
                    await deleteWorkSchedule(day.id);
                    updateDay(key, {id: null, message: "Radni dan je uklonjen"});
                } else {
                    updateDay(key, {message:"Nema promena"});
                }
            }else{
                const saved = await saveWorkSchedule({
                    dayOfWeek: key,
                    startTime: `${day.start}:00`,
                    endTime: `${day.end}:00`,
                    breaks: day.breaks.map((b) => ({
                        startTime: `${b.start}:00`,
                        endTime: `${b.end}:00`,
                    })),
                });
                updateDay(key, {id: saved.id, message: "Sacuvano"});
            }
        } catch(err) {
            updateDay(key, {
                error: err instanceof Error ? err.message: "Greska pri cuvanju.",
            });
        } finally {
            updateDay(key, {saving: false});
        }
    }

    if(loading) return <p>Ucitavanje....</p>
    if(loadError) return <p>{loadError}</p>

    return (
        <div>
            <h1>Moj raspored</h1>

            {days.map((day) => (
                <div key={day.dayOfWeek}>
                    <h3>
                        <label >
                            <input 
                                type="checkbox"
                                checked={day.enabled}
                                onChange={(e) => 
                                    updateDay(day.dayOfWeek, {enabled: e.target.checked, message: null})
                                } /> {" "}
                                {NAMES[day.dayOfWeek]}
                        </label>
                    </h3>

                     {day.enabled && (
            <div>
              <input
                type="time"
                value={day.start}
                onChange={(e) => updateDay(day.dayOfWeek, { start: e.target.value, message: null })}
              />
              {" do "}
              <input
                type="time"
                value={day.end}
                onChange={(e) => updateDay(day.dayOfWeek, { end: e.target.value, message: null })}
              />

              {day.breaks.map((b, i) => (
                <div key={i}>
                  Pauza:{" "}
                  <input
                    type="time"
                    value={b.start}
                    onChange={(e) => updateBreak(day, i, "start", e.target.value)}
                  />
                  {" do "}
                  <input
                    type="time"
                    value={b.end}
                    onChange={(e) => updateBreak(day, i, "end", e.target.value)}
                  />{" "}
                  <button type="button" onClick={() => removeBreak(day, i)}>
                    Ukloni
                  </button>
                </div>
              ))}

              <button type="button" onClick={() => addBreak(day)}>
                Dodaj pauzu
              </button>
            </div>
          )}

          <button onClick={() => handleSave(day)} disabled={day.saving}>
            Sačuvaj
          </button>
          {day.message && <span> {day.message}</span>}
          {day.error && <p>{day.error}</p>}
                </div>
            ))}
        </div>
    )

}
