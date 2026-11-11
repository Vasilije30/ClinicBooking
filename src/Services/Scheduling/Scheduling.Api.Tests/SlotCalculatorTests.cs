using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;
using Scheduling.Api.Services;

namespace Scheduling.Api.Tests
{
    public class SlotCalulatorTests
    {
        private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Belgrade");
        private static readonly DateOnly TestDate = new(2027, 1, 11);
        private static readonly DateTime NowUtc = new(2027, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private static LocalRange Local(string start, string end) =>
            new(TimeOnly.Parse(start), TimeOnly.Parse(end));

        private static DateTime ToUtc(string time) =>
            TimeZoneInfo.ConvertTimeToUtc(
                TestDate.ToDateTime(TimeOnly.Parse(time), DateTimeKind.Unspecified), Zone);
        private static UtcRange UtcFromLocal(string start, string end) =>
        new(ToUtc(start), ToUtc(end));

        private static string ToLocalText(DateTime utc) =>
        TimeZoneInfo.ConvertTimeFromUtc(utc, Zone).ToString("HH:mm");

        [Fact]
        public void Calculate_RemovesBreaksAndBookedAppointments()
        {
            var slots = SlotCalculator.Calculate(
                TestDate, Zone,
                workHours: Local("08:00", "12:00"),
                breaks: [Local("10:00", "10:30")],
                timeOffs: [],
                booked: [UtcFromLocal("09:00", "09:30")],
                durationMinutes: 30,
                nowUtc: NowUtc);

            var starts = slots.Select(s => ToLocalText(s.StartAt)).ToList();

            var expected = new List<string>
            {
                "08:00", "08:15", "08:30",
                "09:30",
                "10:30", "10:45", "11:00", "11:15", "11:30"
            };
            Assert.Equal(expected, starts);
        }

        [Fact]
        public void Calculate_ReturnsEmpty_WhenDoctorDoesNotWork()
        {
            var slots = SlotCalculator.Calculate(
                TestDate, Zone,
                workHours: null,
                breaks: [],
                timeOffs: [],
                booked: [],
                durationMinutes: 30,
                nowUtc: NowUtc);

            Assert.Empty(slots);
        }
        [Fact]
        public void Calculate_RemovesSlotsOverlappingTimeOff()
        {
            var slots = SlotCalculator.Calculate(
                TestDate, Zone,
                workHours: Local("08:00", "12:00"),
                breaks: [],
                timeOffs: [UtcFromLocal("09:00", "10:00")],
                booked: [],
                durationMinutes: 30,
                nowUtc: NowUtc);

            var starts = slots.Select(s => ToLocalText(s.StartAt)).ToList();

            var expected = new List<string>
    {
        "08:00", "08:15", "08:30",
        "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30"
    };
            Assert.Equal(expected, starts);
        }

        [Fact]
        public void Calculate_DropsSlotsBeforeMinimumLeadTime()
        {
            var now = ToUtc("07:30");

            var slots = SlotCalculator.Calculate(
                TestDate, Zone,
                workHours: Local("08:00", "10:00"),
                breaks: [],
                timeOffs: [],
                booked: [],
                durationMinutes: 30,
                nowUtc: now);

            var starts = slots.Select(s => ToLocalText(s.StartAt)).ToList();

            var expected = new List<string> { "08:30", "08:45", "09:00", "09:15", "09:30" };
            Assert.Equal(expected, starts);
        }

        [Fact]
        public void Calculate_ReturnsEmpty_WhenDayAlreadyPassed()
        {
            var slots = SlotCalculator.Calculate(
                TestDate, Zone,
                workHours: Local("08:00", "12:00"),
                breaks: [],
                timeOffs: [],
                booked: [],
                durationMinutes: 30,
                nowUtc: ToUtc("20:00"));

            Assert.Empty(slots);
        }

        [Theory]
        [InlineData(2027, 1, 11, 7)]
        [InlineData(2027, 7, 12, 6)]
        public void Calculate_UsesCorrectUtcOffsetForDate(int year, int month, int day, int expectedUtcHour)
        {
            var date = new DateOnly(year, month, day);

            var slots = SlotCalculator.Calculate(
                date, Zone,
                workHours: Local("08:00", "09:00"),
                breaks: [],
                timeOffs: [],
                booked: [],
                durationMinutes: 30,
                nowUtc: NowUtc);

            var expected = new DateTime(year, month, day, expectedUtcHour, 0, 0, DateTimeKind.Utc);
            Assert.Equal(expected, slots[0].StartAt);
        }
    }
}
