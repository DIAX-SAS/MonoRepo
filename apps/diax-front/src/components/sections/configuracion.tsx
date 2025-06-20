import * as React from 'react';
import {
  type Filters,
  type Parameters,
} from '../../app/dashboard/dashboard.types';
import { DateRangePicker } from '../core';
import styles from "../../app/dashboard-new/styles.module.scss"

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
    <div className={`${styles.cube_container} ${styles.config}`}>
      <div className={`${styles.tab_container} ${styles.columns}`}>
        <div className={`${styles.tab_subcontainer} ${styles.columns}`}>
          <div className={`${styles.columns} ${styles.center}`}>
            <span className={`${styles.span}`}>1 Reporte</span>
            <span className={`${styles.span}`}>&nbsp;&nbsp;✖</span>
          </div>
        </div>
        <div className={styles.center}>
          <span className={`${styles.span}`}>+</span>
        </div>
      </div>

      <div
        className={styles.title_container}
        style={{ borderBottom: '2px solid var(--color-negro)' }}
      >
        <h2 className={`${styles.titleContainer} ${styles.h2}`}>
          Configuración <div className={styles.reportTitle}>Live</div>
        </h2>
        <div className={styles.columns}>
          <div className={`${styles.relative} ${styles.button_download_parent}`}>
            <div className={`${styles.button_download_id} ${styles.button_main} ${styles.center}`}>
              <div className={styles.button_download} />
            </div>
            <div className={`${styles.menu_download} ${styles.noselect}`}>
              <div className={`${styles.columns} ${styles.center}`}>
                <div className={styles.button_download} />
                PDF
              </div>
              <div className={`${styles.columns} ${styles.center}`}>
                <div className={styles.button_download} />
                XLSX
              </div>
            </div>
          </div>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>

      <div className={styles.sub_config}>
        <div className={`${styles.columns} ${styles.center} ${styles.margin_gd} ${styles.rows}`}>
          <div className={`${styles.left_rows} ${styles.rows} ${styles.rangoCont}`}>
            <div className={styles.inicio_fin}>Rango</div>
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

          <div className={`${styles.liveContainer} ${styles.rows} ${styles.padding_pq}`}>
            <div className={`${styles.columns} ${styles.noselect} ${styles.center}`}>
              <label className={`${styles.label}`} htmlFor="live">Live</label>
              <input
                id="live"
                name="live"
                type="checkbox"
                className={`${styles.input}`}
                checked={parameters.live}
                onChange={(e) =>
                  handleChangeParameters('live', e.target.checked)
                }
              />
              <div className={styles.interrogation}>?</div>
            </div>

            <div className={`${styles.minCont} ${styles.columns} ${styles.noselect} ${styles.center}`}>
              <label className={`${styles.label}`} htmlFor="stepUnit">Unidad</label>
              <select
                id="stepUnit"
                className={`${styles.select}`}
                name="step"
                value={parameters.step}
                onChange={(e) =>
                  setParameters((prev) => ({ ...prev, step: e.target.value }))
                }
              >
                <option className={`${styles.option}`} value="second">Segundo</option>
                <option className={`${styles.option}`} value="minute">Minuto</option>
                <option className={`${styles.option}`} value="hour">Hora</option>
              </select>
              <div className={styles.interrogation}>?</div>
            </div>
          </div>
        </div>

        <div className={styles.subSubConfig}>
          {Object.entries(filters).map(([stateName, valuesMap]) => {
            const isOpen = openStates[stateName];
            const allChecked = Array.from(valuesMap.values()).every(Boolean);

            return (
              <div
                key={stateName}
                className={styles.selected_form}
              >
                <div
                  className={`${styles.selected_head} ${styles.center}`}
                  onClick={() => toggleSection(stateName)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className={`${styles.h3}`}>{stateName}</h3>
                  <div className={styles.columns}>
                    <div className={styles.button_arrow_down}>
                      <div />
                    </div>
                  </div>
                </div>

                <div
                  className={styles.search_section}
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <div>
                    <input
                      type="checkbox"
                      className={`${styles.toggle_all} ${styles.input}`}
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
                    <label className={`${styles.label}`}>Todos</label>
                  </div>

                  <div className={styles.rows}>
                    {Array.from(valuesMap).map(([value, checked]) => (
                      <div key={value}>
                        <input
                          type="checkbox"
                          id={`${stateName}_${value}`}
                          className={`${styles.input}`}
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
                        <label className={`${styles.label}`} htmlFor={`${stateName}_${value}`}>{value}</label>
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
