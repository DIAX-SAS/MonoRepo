import * as React from 'react';
import {
  PimmsStepUnit,
  type Filters,
  type Parameters,
} from '../../app/dashboard/dashboard.types';
import { DateRangePicker } from '../core';
import styles from '../../app/dashboard/styles.module.scss';

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

  const [active, setActive] = React.useState(true);
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
    <div className={`${styles['cube-container']} ${styles.config}`}>
      <div className={styles['title-container']}>
        <h2 className={`${styles.h2}`}>Configuración</h2>
        <div className={styles.columns}>
          <div className={`${styles['download-icon']} ${styles['button-main']}`}>
            <div />
         
          </div>
          <div
            onClick={() => setActive(prev => !prev)} 
            className={`${styles['button-minimize-down']} ${styles['button-main']} ${styles.center}`}
          >
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles['sub-config']} ${active ? '' : styles.hide}`}>
        <div
          className={`${styles.columns} ${styles.center} ${styles['margin-gd']} ${styles.settings}`}
        >
          <div
            className={`${styles['left-rows']} ${styles.rows} ${styles['rango-cont']}`}
          >
            <div className={styles['inicio_fin']}>Rango</div>
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

          <div
            className={`${styles['live-container']} ${styles.rows} ${styles['padding-pq']}`}
          >
            <div
              className={`${styles['min-cont']} ${styles.columns} ${styles.noselect} ${styles.center}`}
            >
              <label className={`${styles.label}`} htmlFor="live">
                Live
              </label>
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
              <label className={`${styles.label}`} htmlFor="stepUnit">
                Unidad
              </label>
              <select
                id="stepUnit"
                className={`${styles.select}`}
                name="step"
                value={parameters.step}
                onChange={(e) =>
                  setParameters((prev) => ({
                    ...prev,
                    step: e.target.value as PimmsStepUnit,
                  }))
                }
              >
                <option className={`${styles.option}`} value="second">
                  Segundo
                </option>
                <option className={`${styles.option}`} value="minute">
                  Minuto
                </option>
                <option className={`${styles.option}`} value="hour">
                  Hora
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles['sub-sub-config']}>
          {Object.entries(filters).map(([stateName, valuesMap]) => {
            const isOpen = openStates[stateName];
            const allChecked = Array.from(valuesMap.values()).every(Boolean);

            return (
              <div key={stateName} className={styles['selected-form']}>
                <div
                  className={`${styles['selected-head']} ${styles.center}`}
                  onClick={() => toggleSection(stateName)}
                  style={{ cursor: 'pointer' }}
                >
                  <h3 className={`${styles.h3}`}>{stateName}</h3>
                  <div className={styles.columns}>
                    <div className={styles['button-minimize-down']}>
                      <div />
                    </div>
                  </div>
                </div>

                <div
                  className={styles['search-section']}
                  style={{ display: isOpen ? 'block' : 'none' }}
                >
                  <div>
                    <input
                      type="checkbox"
                      className={`${styles['toggle-all']} ${styles.input}`}
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
                              [stateName]: new Map(
                                prev[stateName as keyof Filters]
                              ).set(value, e.target.checked),
                            }));
                          }}
                        />
                        <label
                          className={`${styles.label}`}
                          htmlFor={`${stateName}_${value}`}
                        >
                          {value}
                        </label>
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
