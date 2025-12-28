export class TimezoneBlock {
    constructor(streamTimezone = 'America/New_York') {
        this.streamTimezone = streamTimezone; // 'America/New_York' (EST) or 'America/Los_Angeles' (PST)
    }

    calculateTimeDifference() {
        const now = new Date();

        // Get stream timezone offset
        const streamTime = new Date(now.toLocaleString('en-US', { timeZone: this.streamTimezone }));
        const localTime = new Date(now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));

        // Calculate difference in hours
        const diffMs = localTime - streamTime;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));

        return diffHours;
    }

    generateScheduleMessage() {
        const diff = this.calculateTimeDifference();

        if (diff === 0) {
            return "This week schedule<br>Same time as you";
        } else if (diff > 0) {
            return `This week schedule<br><strong>${Math.abs(diff)} hours</strong> later for you`;
        } else {
            return `This week schedule<br><strong>${Math.abs(diff)} hours</strong> earlier for you`;
        }
    }

    convertStreamTimeToLocal(streamHour, streamMinute = 0) {
        // Create a date in the stream timezone
        const now = new Date();
        const streamDate = new Date(now.toLocaleString('en-US', { timeZone: this.streamTimezone }));
        streamDate.setHours(streamHour, streamMinute, 0, 0);

        // Get the timestamp
        const streamTimestamp = streamDate.getTime();
        const diff = this.calculateTimeDifference();

        // Add the difference
        const localDate = new Date(streamTimestamp + (diff * 60 * 60 * 1000));

        return localDate;
    }

    generateUsualStreamMessage(startHour, endHour, startMinute = 0, endMinute = 0) {
        const localStart = this.convertStreamTimeToLocal(startHour, startMinute);
        const localEnd = this.convertStreamTimeToLocal(endHour, endMinute);

        const formatTime = (date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutesStr = minutes > 0 ? `:${minutes.toString().padStart(2, '0')}` : '';
            return `${hours}${minutesStr} ${ampm}`;
        };

        return `Streams are usually from <strong>${formatTime(localStart)}</strong> to <strong>${formatTime(localEnd)}</strong><br>for your timezone`;
    }

    updateScheduleContent(selector) {
        const element = document.querySelector(selector);
        if (element) {
            è
            element.innerHTML = this.generateScheduleMessage();
        }
    }

    updateUsualStreamContent(selector, startHour, endHour, startMinute = 0, endMinute = 0) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = this.generateUsualStreamMessage(startHour, endHour, startMinute, endMinute);
        }
    }

    static create(streamTimezone) {
        return new TimezoneBlock(streamTimezone);
    }
}