import * as React from 'react';
import {
  type Filters,
  type Parameters,
} from '../../app/dashboard/dashboard.types';
import { DateRangePicker } from '../core';

interface ConfigurationProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  parameters: Parameters;
  setParameters: React.Dispatch<React.SetStateAction<Parameters>>;
}

const Configuration: React.FC<ConfigurationProps> = ({
  filters,
  setFilters,
  parameters,
  setParameters,
}) => {
  const [openStates, setOpenStates] = React.useState<Record<string, boolean>>(
    {}
  );

  const toggleSection = (stateName: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [stateName]: !prev[stateName],
    }));
  };

  const handleChangeParameters = <T extends keyof Parameters>(
    key: T,
    value: Parameters[T]
  ) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="cube_container" id="config">
      <div className="tab_container columns">
        <div className="tab_subcontainer columns">
          <div className="columns center">
            <span>1 Reporte</span>
            <span>&nbsp;&nbsp;✖</span>
          </div>
        </div>
        <div className="center">
          <span>+</span>
        </div>
      </div>

      <div
        className="title_container"
        style={{ borderBottom: '2px solid var(--color-negro)' }}
      >
        <h2 id="titleContainer">
          Configuración <div id="reportTitle">Live</div>
        </h2>
        <div className="columns">
          <div className="relative button_download_parent">
            <div id="button_download_id" className="button_main center">
              <div className="button_download" />
            </div>
            <div className="menu_download noselect">
              <div className="columns center">
                <div className="button_download" />
                PDF
              </div>
              <div className="columns center">
                <div className="button_download" />
                XLSX
              </div>
            </div>
          </div>
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>

      <div id="sub_config">
        <div className="columns center margin_gd rows">
          <div className="left_rows rows" id="rangoCont">
            <div id="inicio_fin">Rango</div>
            <DateRangePicker
              data-testid="dateRangePicker"
              format="dd MMM yyyy hh:mm:ss aa"
              showMeridiem
              onChange={(value) => {
                const [initTime, endTime] = value ?? [];
                handleChangeParameters(
                  'startDate',
                  initTime ? new Date(initTime).getTime() : Date.now()
                );
                handleChangeParameters(
                  'endDate',
                  endTime ? new Date(endTime).getTime() : Date.now()
                );
              }}
              readOnly={parameters.live}
              value={
                parameters.startDate && parameters.endDate
                  ? [
                      new Date(parameters.startDate),
                      new Date(parameters.endDate),
                    ]
                  : null
              }
            />
          </div>

          <div id="liveContainer" className="rows padding_pq">
            <div className="columns noselect center">
              <label htmlFor="live">Live</label>
              <input
                id="live"
                name="live"
                type="checkbox"
                checked={parameters.live}
                onChange={(e) =>
                  handleChangeParameters('live', e.target.checked)
                }
              />
              <div className="interrogation">?</div>
            </div>

            <div id="minCont" className="columns noselect center">
              <label htmlFor="stepUnit">Unidad</label>
              <select
                id="stepUnit"
                name="step"
                value={parameters.step}
                onChange={(e) =>
                  setParameters((prev) => ({ ...prev, step: e.target.value }))
                }
              >
                <option value="second">Segundo</option>
                <option value="minute">Minuto</option>
                <option value="hour">Hora</option>
              </select>
              <div className="interrogation">?</div>
            </div>
          </div>
        </div>

        <div id="subSubConfig">
          {Object.entries(filters).map(([stateName, valuesMap]) => {
            const isOpen = openStates[stateName];
            const allChecked = Array.from(valuesMap.values()).every(Boolean);

            return (
              <div
                key={stateName}
                className="selected_form"
                id={`${stateName}_config`}
              >
                <div
                  className="selected_head center"
                  onClick={() => toggleSection(stateName)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>{stateName}</h3>
                  <div className="columns">
                    <div className="button_arrow_down">
                      <div />
                    </div>
                  </div>
                </div>

                <div
                  className="search_section"
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <div>
                    <input
                      type="checkbox"
                      className="toggle_all"
                      checked={allChecked}
                      onChange={(e) => {
                        const newMap = new Map<string, boolean>();
                        for (const [key] of valuesMap) {
                          newMap.set(key, e.target.checked);
                        }
                        setFilters((prev) => ({
                          ...prev,
                          [stateName]: newMap,
                        }));
                      }}
                    />
                    <label>Todos</label>
                  </div>

                  <div className="rows">
                    {Array.from(valuesMap).map(([value, checked]) => (
                      <div key={value}>
                        <input
                          type="checkbox"
                          id={`${stateName}_${value}`}
                          name={value}
                          value={value}
                          checked={checked}
                          onChange={(e) => {
                            setFilters((prev) => ({
                              ...prev,
                              [stateName]: new Map(prev[stateName]).set(
                                value,
                                e.target.checked
                              ),
                            }));
                          }}
                        />
                        <label htmlFor={`${stateName}_${value}`}>{value}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
