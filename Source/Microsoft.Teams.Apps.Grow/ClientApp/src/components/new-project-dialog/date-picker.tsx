import * as React from "react";
import moment from "moment";
import { Divider, Flex } from '@fluentui/react-northstar';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';
import { Fabric, Customizer } from 'office-ui-fabric-react/lib';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { DarkCustomizations } from "../../helpers/DarkCustomizations";
import { DefaultCustomizations } from "../../helpers/DefaultCustomizations";
import Constants from "../../constants/resources";
initializeIcons();

interface IDateePickerProps {
    startDate: Date;
    endDate: Date;
    getStartDate: (startDate: Date) => void,
    getEndDate: (endDate: Date) => void
}
const controlClass = mergeStyleSets({
    control: {
        margin: '0 0 15px 0',
        maxWidth: '300px'
    }
});
const StartDateEndDate: React.FC<IDateePickerProps> = props => {

    let search = window.location.search;
    let params = new URLSearchParams(search);
    let theme = params.get("theme");

    let datePickerTheme;
    if (theme === Constants.dark) { datePickerTheme = DarkCustomizations }
    else if (theme === Constants.contrast) { datePickerTheme = DarkCustomizations }
    else { datePickerTheme = DefaultCustomizations }

    const { t } = useTranslation();
    const [startDate, setStartDate] = useState<Date | null | undefined>(props.startDate);
    const [endDate, setEndDate] = useState<Date | null | undefined>(props.endDate);
    const [minEndDate, setMinEndDate] = useState<Date>(new Date(moment().add(1, 'd').format()));
    const [calendarDate, setCalendarDate] = useState<Date | null | undefined>(null);

    /**
       * Handle change event for cycle start date picker.
       * @param date | cycle start date.
       */
    const onSelectStartDate = (date: Date | null | undefined): void => {
        let startCycle = moment(date)
            .set('hour', moment().hour())
            .set('minute', moment().minute())
            .set('second', moment().second());
        setMinEndDate(new Date(moment(startCycle.toDate()).add(1, 'd').format()));
        props.getStartDate(startCycle.toDate()!);
        setStartDate(startCycle.toDate());
    };

    /**
     * Handle change event for cycle end date picker.
     * @param date | cycle end date.
     */
    const onSelectEndDate = (date: Date | null | undefined): void => {
        let endCycle = moment(date)
            .set('hour', moment().hour())
            .set('minute', moment().minute())
            .set('second', moment().second());

        props.getEndDate(endCycle.toDate()!);
        setEndDate(endCycle.toDate());
    }
    /**
     * Handle change event for end by date picker.
     * @param date | end by date.
     */
    const onSelectCalendarDate = (date: Date | null | undefined): void => {
        setCalendarDate(date);
    };

    const onParseDateFromString = (val: string): Date => {
        const date = new Date();
        const values = (val || '').trim().split('/');
        const day = val.length > 0 ? Math.max(1, Math.min(31, parseInt(values[0], 10))) : date.getDate();
        const month = val.length > 1 ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1 : date.getMonth();
        let year = val.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
        if (year < 100) {
            year += date.getFullYear() - (date.getFullYear() % 100);
        }
        return new Date(year, month, day);
    };


    return (
        <>
            <div>
                <Flex gap="gap.small">
                    <Flex.Item size="size.half">
                        <div>
                            <Fabric>
                                <Customizer {...datePickerTheme}>
                                    <DatePicker
                                        className="date-picker"
                                        label={t('*Start date')}
                                        allowTextInput={true}
                                        showMonthPickerAsOverlay={true}
                                        minDate={new Date()}
                                        isMonthPickerVisible={true}
                                        value={startDate!}
                                        onSelectDate={onSelectStartDate}
                                        parseDateFromString={onParseDateFromString}
                                    />
                                </Customizer>
                            </Fabric>
                        </div>
                    </Flex.Item>
                    <Flex.Item size="size.half">
                        <div>
                            <Fabric>
                                <Customizer {...datePickerTheme}>
                                    <DatePicker
                                        className={controlClass.control}
                                        label={t('*End date')}
                                        allowTextInput={true}
                                        minDate={minEndDate}
                                        isMonthPickerVisible={true}
                                        showMonthPickerAsOverlay={true}
                                        value={endDate!}
                                        onSelectDate={onSelectEndDate}
                                        parseDateFromString={onParseDateFromString}
                                    />
                                </Customizer>
                            </Fabric>
                        </div>
                    </Flex.Item>
                </Flex>
            </div>
        </>

    );
}

export default StartDateEndDate;
