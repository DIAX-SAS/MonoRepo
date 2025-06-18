import React from 'react';

const Configuration: React.FC = () => {
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

      {/* Subconfig and filter sections would be extracted as subcomponents later */}
      <div id="sub_config">
        <div className="columns center margin_gd rows">
          <div className="left_rows rows" id="rangoCont">
            <div id="inicio_fin">Rango</div>
            <input
              id="datetimes"
              type="text"
              name="datetimes"
              disabled
              style={{ backgroundColor: 'gray', color: 'white' }}
            />
            <div id="configError" style={{ display: 'none' }}></div>
          </div>

          <div id="liveContainer" className="rows padding_pq">
            <div className="columns noselect center">
              <label htmlFor="live">Live</label>
              <input id="live" name="live" type="checkbox" />
              <div className="interrogation">?</div>
            </div>

            <div id="offsetCont" className="columns noselect center">
              <label htmlFor="offset">Offset</label>
              <input id="offset" name="offset" type="checkbox" defaultChecked />
              <div className="interrogation">?</div>
            </div>

            <div id="minCont" className="columns noselect center">
              <label htmlFor="minForce">Minutos</label>
              <input
                id="minForce"
                name="offset"
                type="checkbox"
                defaultChecked
              />
              <div className="interrogation">?</div>
            </div>
          </div>
        </div>
        <div id="subSubConfig">
          <div className="selected_form" id="maquinas_config">
            <div className="selected_head center">
              <h3>Equipo (Estado)</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name="Iny2"
                    defaultValue="Iny2"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny2">
                    Iny2 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny3"
                    defaultValue="Iny3"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny3">
                    Iny3 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny4"
                    defaultValue="Iny4"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny4">
                    Iny4 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny6"
                    defaultValue="Iny6"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny6">
                    Iny6 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny7"
                    defaultValue="Iny7"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny7">
                    Iny7 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny8"
                    defaultValue="Iny8"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny8">
                    Iny8 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny10"
                    defaultValue="Iny10"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny10">
                    Iny10 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny11"
                    defaultValue="Iny11"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny11">
                    Iny11 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny12"
                    defaultValue="Iny12"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny12">
                    Iny12 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name="Iny13"
                    defaultValue="Iny13"
                    defaultChecked=""
                  />
                  <label htmlFor="Iny13">
                    Iny13 (<span style={{ color: 'green' }}>On</span>)
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="selected_form" id="operarios_config">
            <div className="selected_head center">
              <h3>Operario</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name={0}
                    defaultValue={0}
                    defaultChecked=""
                  />
                  <label htmlFor={0}>0 (Iny: 3, 4, 6, 7, 8, 11, 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={184}
                    defaultValue={184}
                    defaultChecked=""
                  />
                  <label htmlFor={184}>184 (Iny: 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={186}
                    defaultValue={186}
                    defaultChecked=""
                  />
                  <label htmlFor={186}>186 (Iny: 3)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={189}
                    defaultValue={189}
                    defaultChecked=""
                  />
                  <label htmlFor={189}>189 (Iny: 13)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={626}
                    defaultValue={626}
                    defaultChecked=""
                  />
                  <label htmlFor={626}>626 (Iny: 7)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={652}
                    defaultValue={652}
                    defaultChecked=""
                  />
                  <label htmlFor={652}>652 (Iny: 11)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={653}
                    defaultValue={653}
                    defaultChecked=""
                  />
                  <label htmlFor={653}>653 (Iny: 6, 10)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={654}
                    defaultValue={654}
                    defaultChecked=""
                  />
                  <label htmlFor={654}>654 (Iny: 13)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={661}
                    defaultValue={661}
                    defaultChecked=""
                  />
                  <label htmlFor={661}>661 (Iny: 8)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={664}
                    defaultValue={664}
                    defaultChecked=""
                  />
                  <label htmlFor={664}>664 (Iny: 2)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={668}
                    defaultValue={668}
                    defaultChecked=""
                  />
                  <label htmlFor={668}>668 (Iny: 4)</label>
                </div>
              </div>
            </div>
          </div>
          <div className="selected_form" id="ordenes_config">
            <div className="selected_head center">
              <h3>Orden</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name={18360}
                    defaultValue={18360}
                    defaultChecked=""
                  />
                  <label htmlFor={18360}>18360 (Iny: 11)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18542}
                    defaultValue={18542}
                    defaultChecked=""
                  />
                  <label htmlFor={18542}>18542 (Iny: 13)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18621}
                    defaultValue={18621}
                    defaultChecked=""
                  />
                  <label htmlFor={18621}>18621 (Iny: 7)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18622}
                    defaultValue={18622}
                    defaultChecked=""
                  />
                  <label htmlFor={18622}>18622 (Iny: 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18623}
                    defaultValue={18623}
                    defaultChecked=""
                  />
                  <label htmlFor={18623}>18623 (Iny: 2)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18630}
                    defaultValue={18630}
                    defaultChecked=""
                  />
                  <label htmlFor={18630}>18630 (Iny: 6)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18631}
                    defaultValue={18631}
                    defaultChecked=""
                  />
                  <label htmlFor={18631}>18631 (Iny: 4)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18683}
                    defaultValue={18683}
                    defaultChecked=""
                  />
                  <label htmlFor={18683}>18683 (Iny: 10)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18709}
                    defaultValue={18709}
                    defaultChecked=""
                  />
                  <label htmlFor={18709}>18709 (Iny: 3)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={18713}
                    defaultValue={18713}
                    defaultChecked=""
                  />
                  <label htmlFor={18713}>18713 (Iny: 8)</label>
                </div>
              </div>
            </div>
          </div>
          <div className="selected_form" id="lotes_config">
            <div className="selected_head center">
              <h3>Lote</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name={4914}
                    defaultValue={4914}
                    defaultChecked=""
                  />
                  <label htmlFor={4914}>4914 (Iny: 11)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={4988}
                    defaultValue={4988}
                    defaultChecked=""
                  />
                  <label htmlFor={4988}>4988 (Iny: 13)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={5011}
                    defaultValue={5011}
                    defaultChecked=""
                  />
                  <label htmlFor={5011}>5011 (Iny: 2, 7, 8, 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={5015}
                    defaultValue={5015}
                    defaultChecked=""
                  />
                  <label htmlFor={5015}>5015 (Iny: 4, 6)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={5035}
                    defaultValue={5035}
                    defaultChecked=""
                  />
                  <label htmlFor={5035}>5035 (Iny: 10)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={5045}
                    defaultValue={5045}
                    defaultChecked=""
                  />
                  <label htmlFor={5045}>5045 (Iny: 3)</label>
                </div>
              </div>
            </div>
          </div>
          <div className="selected_form" id="colores_config">
            <div className="selected_head center">
              <h3>Molde</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name={6630}
                    defaultValue={6630}
                    defaultChecked=""
                  />
                  <label htmlFor={6630}>6630 (Iny: 10)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8511}
                    defaultValue={8511}
                    defaultChecked=""
                  />
                  <label htmlFor={8511}>8511 (Iny: 6)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8513}
                    defaultValue={8513}
                    defaultChecked=""
                  />
                  <label htmlFor={8513}>8513 (Iny: 4)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8572}
                    defaultValue={8572}
                    defaultChecked=""
                  />
                  <label htmlFor={8572}>8572 (Iny: 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8584}
                    defaultValue={8584}
                    defaultChecked=""
                  />
                  <label htmlFor={8584}>8584 (Iny: 8)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8586}
                    defaultValue={8586}
                    defaultChecked=""
                  />
                  <label htmlFor={8586}>8586 (Iny: 7)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8587}
                    defaultValue={8587}
                    defaultChecked=""
                  />
                  <label htmlFor={8587}>8587 (Iny: 2)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8611}
                    defaultValue={8611}
                    defaultChecked=""
                  />
                  <label htmlFor={8611}>8611 (Iny: 3)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={8930}
                    defaultValue={8930}
                    defaultChecked=""
                  />
                  <label htmlFor={8930}>8930 (Iny: 11)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={9401}
                    defaultValue={9401}
                    defaultChecked=""
                  />
                  <label htmlFor={9401}>9401 (Iny: 13)</label>
                </div>
              </div>
            </div>
          </div>
          <div className="selected_form" id="materiales_config">
            <div className="selected_head center">
              <h3>Material</h3>
              <div className="columns">
                <div className="button_arrow_down">
                  <div />
                </div>
              </div>
            </div>
            {/*Search de Select*/}
            <div className="search_section" style={{ display: 'none' }}>
              <div>
                <input
                  type="checkbox"
                  className="toggle_all"
                  defaultChecked=""
                />
                <label>Todos</label>
                {/*<input type="text">*/}
              </div>
              <div className="rows">
                <div>
                  <input
                    type="checkbox"
                    name={5}
                    defaultValue={5}
                    defaultChecked=""
                  />
                  <label htmlFor={5}>5 (Iny: 10)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={10}
                    defaultValue={10}
                    defaultChecked=""
                  />
                  <label htmlFor={10}>10 (Iny: 13)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={16}
                    defaultValue={16}
                    defaultChecked=""
                  />
                  <label htmlFor={16}>16 (Iny: 2, 3, 4, 8)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={22}
                    defaultValue={22}
                    defaultChecked=""
                  />
                  <label htmlFor={22}>22 (Iny: 7)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={30}
                    defaultValue={30}
                    defaultChecked=""
                  />
                  <label htmlFor={30}>30 (Iny: 6, 12)</label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    name={44}
                    defaultValue={44}
                    defaultChecked=""
                  />
                  <label htmlFor={44}>44 (Iny: 11)</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
