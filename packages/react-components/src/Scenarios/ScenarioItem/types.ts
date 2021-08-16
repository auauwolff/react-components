import { MenuItem, Routes, Scenario, Status } from '../types';

interface ScenarioItemProps {
  /**
   * Style of the scenario item
   */
  classes?: any;
  menu: MenuItem[];
  scenario: Scenario;
  /**
   * The scenario menu function handlers
   */
  onContextMenuClick: (menuItem: MenuItem, scenario: Scenario) => void;

  /**
   * Scenario item click event handler
   */
  onClick: (scenario) => void;

  status: Status;
  /**
   * Indicates if the hour of the scenario should be shown
   */
  showHour: boolean;
  /**
   * Indicates if the menu options of the scenario should be shown
   */
  showMenu: boolean;
  /**
   * Indicates if the status of the scenario should be shown
   */
  showStatus: boolean;
  /**
   * Indicates scenario is selected or not
   */
  isSelected: boolean;
  /**
   * The Name of scenario
   */
  name: string;
  /**
   * An optional accent colour for the name field
   */
  nameAccentColour?: string;
  /**
   * The Date of scenario creation
   */
  date: string | null;
  /**
   * The Description of scenario
   */
  description: {
    /**
     * Scenario description label
     */
    name: string;
    /**
     * Scenario description value
     */
    value: string;
  }[];
  /**
   * Time zone (IANA format) for date display
   */
  timeZone?: string;
  /**
   * List of availables routes
   */
  routes?: Routes[];
}

export default ScenarioItemProps;
