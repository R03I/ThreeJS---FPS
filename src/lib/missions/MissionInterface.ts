export default interface MissionInterface {
    objectives: any;
    Init(): void;
    Complete(): void;
    Reset(): void;
}