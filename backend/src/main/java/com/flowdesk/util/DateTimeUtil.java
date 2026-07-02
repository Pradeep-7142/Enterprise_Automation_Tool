package com.flowdesk.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public final class DateTimeUtil {
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DISPLAY = DateTimeFormatter.ofPattern("MMM d, yyyy");

    private DateTimeUtil() {}

    public static String formatDate(Instant instant) {
        if (instant == null) return null;
        return DATE.format(instant.atZone(ZoneOffset.UTC));
    }

    public static String formatDateTime(Instant instant) {
        if (instant == null) return null;
        return DATETIME.format(instant.atZone(ZoneOffset.UTC));
    }

    public static String formatDisplayDate(Instant instant) {
        if (instant == null) return null;
        return DISPLAY.format(instant.atZone(ZoneOffset.UTC));
    }

    public static String formatLocalDate(LocalDate date) {
        if (date == null) return null;
        return date.toString();
    }

    public static String relativeTime(Instant instant) {
        if (instant == null) return "";
        long minutes = ChronoUnit.MINUTES.between(instant, Instant.now());
        if (minutes < 1) return "just now";
        if (minutes < 60) return minutes + " min ago";
        long hours = ChronoUnit.HOURS.between(instant, Instant.now());
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        long days = ChronoUnit.DAYS.between(instant, Instant.now());
        if (days == 1) return "Yesterday";
        if (days < 7) return days + " days ago";
        return formatDate(instant);
    }

    public static String shortRelative(Instant instant) {
        if (instant == null) return "";
        long minutes = ChronoUnit.MINUTES.between(instant, Instant.now());
        if (minutes < 60) return minutes + "m";
        long hours = ChronoUnit.HOURS.between(instant, Instant.now());
        if (hours < 24) return hours + "h";
        long days = ChronoUnit.DAYS.between(instant, Instant.now());
        if (days == 1) return "Yesterday";
        return days + "d";
    }
}
