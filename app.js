function App() {
  const [requests, setRequests] = React.useState("");
  const [algorithm, setAlgorithm] = React.useState("FCFS");
  const [result, setResult] = React.useState(null);
  const [headPos, setHeadPos] = React.useState(50);

  const seekChartRef = React.useRef(null);
  const positionChartRef = React.useRef(null);
  const seekChartInstance = React.useRef(null);
  const positionChartInstance = React.useRef(null);
  const animRef = React.useRef(null);

  async function simulate() {
    if (!requests.trim()) {
      alert("Please enter request values.");
      return;
    }

    const reqList = requests
      .split(/[ ,]+/)
      .map(Number)
      .filter(n => !isNaN(n));

    try {
      const response = await fetch("http://localhost:5000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: reqList,
          initial_head: 50,
          algorithm: algorithm,
          direction: "right",
          disk_size: 500
        })
      });

      const data = await response.json();
      setResult(data);

      animateHead(data.order || []);
      setTimeout(() => createCharts(data), 300);
    } catch (err) {
      alert("Backend not running!");
      console.error(err);
    }
  }

  function animateHead(order) {
    if (!order || order.length === 0) return;
    if (animRef.current) {
      clearInterval(animRef.current);
      animRef.current = null;
    }
    let i = 0;
    setHeadPos(order[0]);
    animRef.current = setInterval(() => {
      if (i >= order.length) {
        clearInterval(animRef.current);
        animRef.current = null;
        return;
      }
      setHeadPos(order[i]);
      i++;
    }, 800);
  }

  function toPercent(v) {
    const val = Math.max(0, Math.min(500, Number(v) || 0));
    return (val / 500) * 100;
  }

  function createCharts(data) {
    if (!data) return;

    if (seekChartInstance.current) {
      seekChartInstance.current.destroy();
      seekChartInstance.current = null;
    }
    if (positionChartInstance.current) {
      positionChartInstance.current.destroy();
      positionChartInstance.current = null;
    }

    // seek chart
    if (seekChartRef.current) {
      const ctx1 = seekChartRef.current.getContext("2d");
      seekChartInstance.current = new Chart(ctx1, {
        type: "bar",
        data: {
          labels: (data.seek_sequence || []).map((_, i) => `Move ${i+1}`),
          datasets: [{
            label: "Seek Distance",
            data: data.seek_sequence || [],
            backgroundColor: "#10b981"
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // line chart
    if (positionChartRef.current) {
      const ctx2 = positionChartRef.current.getContext("2d");
      positionChartInstance.current = new Chart(ctx2, {
        type: "line",
        data: {
          labels: (data.order || []).map((_, i) => `Step ${i}`),
          datasets: [{
            label: "Head Position",
            data: data.order || [],
            borderColor: "#3b82f6",
            borderWidth: 3,
            fill: false,
            tension: 0.25
          }]
        },
        options: { responsive: true }
      });
    }
  }

  React.useEffect(() => {
    return () => {
      if (seekChartInstance.current) seekChartInstance.current.destroy();
      if (positionChartInstance.current) positionChartInstance.current.destroy();
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  return (
    <div className="card">
      <label>Enter Requests</label>
      <input
        type="text"
        placeholder="Example: 95 180 34 119 11"
        value={requests}
        onChange={(e) => setRequests(e.target.value)}
      />

      <label>Select Algorithm</label>
      <select
        value={algorithm}
        onChange={(e) => setAlgorithm(e.target.value)}
      >
        <option value="FCFS">FCFS</option>
        <option value="SSTF">SSTF</option>
        <option value="SCAN">SCAN</option>
        <option value="C-SCAN">C-SCAN</option>
        <option value="LOOK">LOOK</option>
        <option value="C-LOOK">C-LOOK</option>
      </select>

      <button onClick={simulate}>Run Simulation</button>

      <div className="track-container">
        <h3 style={{textAlign: "center", color: "white"}}>Disk Head Movement</h3>

        <div className="track-line">
          <div
            className="head"
            style={{ left: `${toPercent(headPos)}%` }}
            title={String(headPos)}
          >
            {String(headPos)}
          </div>

          {result && Array.isArray(result.order) && result.order.map((val, i) => (
            <div
              key={i}
              className="request-dot"
              style={{ left: `${toPercent(val)}%` }}
            >
              {val}
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div className="result-box">
          <h3>Seek Distance Graph</h3>
          <canvas ref={seekChartRef}></canvas>
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>Head Movement Graph</h3>
          <canvas ref={positionChartRef}></canvas>
        </div>
      )}

      {result && (
        <div className="result-box">
          <h3>Raw Output</h3>
          <pre style={{margin:0}}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
