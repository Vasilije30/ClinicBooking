namespace Scheduling.Api.Services;

public record LocalRange(TimeOnly Start, TimeOnly End);
public record UtcRange(DateTime Start, DateTime End);
public record Slot(DateTime StartAt, DateTime EndAt);

public static class SlotCalculator
{
    public const int StepMinutes = 15;
    public const int MinLeadMinutes = 60;

    public static List<Slot> Calculate(
        DateOnly date,
        TimeZoneInfo zone,
        LocalRange? workHours,
        IReadOnlyList<LocalRange> breaks,
        IReadOnlyList<UtcRange> timeOffs,
        IReadOnlyList<UtcRange> booked,
        int durationMinutes,
        DateTime nowUtc)
    {
        var slots = new List<Slot>();
        if (workHours is null || durationMinutes <= 0) return slots;

        var dayStart = ToUtc(date, workHours.Start, zone);
        var dayEnd = ToUtc(date, workHours.End, zone);

        var blocked = new List<UtcRange>();
        blocked.AddRange(breaks.Select(b => new UtcRange(ToUtc(date, b.Start, zone), ToUtc(date, b.End, zone))));
        blocked.AddRange(timeOffs);
        blocked.AddRange(booked);

        var duration = TimeSpan.FromMinutes(durationMinutes);
        var step = TimeSpan.FromMinutes(StepMinutes);
        var earliest = nowUtc.AddMinutes(MinLeadMinutes);

        


        for(var start = dayStart; start + duration <= dayEnd; start += step)
        {
            var end = start + duration;

            if (start < earliest) continue;
            if (blocked.Any(b => Overlaps(start, end, b.Start, b.End))) continue;

            slots.Add(new Slot(start, end));
        }

        return slots;
    }

    private static bool Overlaps(DateTime aStart, DateTime aEnd, DateTime bStart, DateTime bEnd) 
        => aStart < bEnd && bStart < aEnd;

    private static DateTime ToUtc(DateOnly date, TimeOnly time, TimeZoneInfo zone)
    {
        var local = date.ToDateTime(time, DateTimeKind.Unspecified);
        if (zone.IsInvalidTime(local)) local = local.AddHours(1);
        return TimeZoneInfo.ConvertTimeToUtc(local,zone);
    }
}

