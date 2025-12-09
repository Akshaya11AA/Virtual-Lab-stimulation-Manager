import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

/**
 * Modular, exam-friendly, single-file rewrite of the Virtual Lab Simulation Manager.
 * - Breaks logic into small classes (Experiment, SimulationLogic, UIStyle)
 * - Stores user-created experiments using Java serialization (experiments.dat)
 * - Keeps UI code readable by separating panel builders
 *
 * How to compile/run:
 * javac VirtualLabSimulationManager.java
 * java VirtualLabSimulationManager
 */
public class VirtualLabSimulationManager {
    private static final String SAVE_FILE = "experiments.dat";

    // application state
    private final Map<String, Experiment> experiments = new LinkedHashMap<>();
    private final java.util.List<String> history = new ArrayList<>();
    private String lastReportText = "";

    // UI references
    private JFrame frame;
    private JLabel statusBar;

    public static void main(String[] args) {
        // platform look and feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {
        }
        SwingUtilities.invokeLater(() -> new VirtualLabSimulationManager().createAndShowGUI());
    }

    public VirtualLabSimulationManager() {
        // default experiments (if file not present)
        experiments.put("Physics Oscillation", new Experiment("Physics Oscillation",
                "Observe and measure properties of simple harmonic oscillators.",
                "mass=..., spring=..., initial=..."));
        experiments.put("Chemical Reaction", new Experiment("Chemical Reaction",
                "Simulate exothermic and endothermic reactions virtually.",
                "reactantA=..., reactantB=..., temp=..."));
        experiments.put("DNA Sequencing", new Experiment("DNA Sequencing",
                "Perform virtual DNA sequencing and analysis.",
                "sampleID=..., type=..."));

        // try to load user-saved experiments
        loadExperiments();
    }

    private void createAndShowGUI() {
        frame = new JFrame("Virtual Lab Simulation Manager");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(800, 600);
        frame.setLocationRelativeTo(null);

        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        mainPanel.setBackground(UIStyle.PAGE_BG);
        frame.setContentPane(mainPanel);

        JLabel titleLabel = new JLabel("Virtual Lab Simulation Manager", SwingConstants.CENTER);
        titleLabel.setFont(UIStyle.TITLE_FONT);
        titleLabel.setForeground(UIStyle.PRIMARY);
        mainPanel.add(titleLabel, BorderLayout.NORTH);

        JTabbedPane tabs = new JTabbedPane();

        // build student experiments tab
        tabs.addTab("Student Experiments", buildSimulationTab());

        // history tab
        tabs.addTab("Experiment History", buildHistoryTab());

        // about tab
        tabs.addTab("About", buildAboutTab());

        mainPanel.add(tabs, BorderLayout.CENTER);

        statusBar = new JLabel("Ready | Virtual Lab | " + LocalDate.now());
        statusBar.setForeground(UIStyle.SECONDARY_TEXT);
        statusBar.setBorder(new EmptyBorder(4, 0, 0, 8));
        mainPanel.add(statusBar, BorderLayout.SOUTH);

        // menu
        JMenuBar menuBar = new JMenuBar();
        JMenu fileMenu = new JMenu("File");
        JMenuItem exitItem = new JMenuItem("Exit");
        exitItem.addActionListener(e -> {
            saveExperiments();
            System.exit(0);
        });
        fileMenu.add(exitItem);
        menuBar.add(fileMenu);
        frame.setJMenuBar(menuBar);

        frame.setVisible(true);
    }

    // -------------------- UI builders --------------------
    private JPanel buildSimulationTab() {
        JPanel simPanel = new JPanel(new BorderLayout(8, 8));
        simPanel.setBackground(UIStyle.PANEL_BG);

        // left: list + buttons
        DefaultListModel<String> simModel = new DefaultListModel<>();
        experiments.keySet().forEach(simModel::addElement);
        JList<String> simList = new JList<>(simModel);
        simList.setFont(UIStyle.MONO);
        simList.setVisibleRowCount(8);
        JScrollPane listScrollPane = new JScrollPane(simList);
        listScrollPane.setBorder(BorderFactory.createTitledBorder("Virtual Experiments"));

        JPanel simButtonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        simButtonPanel.setBackground(UIStyle.PANEL_BG);
        JButton addButton = new JButton("Add");
        JButton editButton = new JButton("Edit");
        JButton deleteButton = new JButton("Delete");
        simButtonPanel.add(addButton);
        simButtonPanel.add(editButton);
        simButtonPanel.add(deleteButton);

        JPanel leftPanel = new JPanel(new BorderLayout(5, 5));
        leftPanel.setBackground(UIStyle.PANEL_BG);
        leftPanel.add(listScrollPane, BorderLayout.CENTER);
        leftPanel.add(simButtonPanel, BorderLayout.SOUTH);

        // center: instructions, params and action buttons
        JPanel simDetailsPanel = new JPanel(new GridBagLayout());
        simDetailsPanel.setBackground(UIStyle.PANEL_BG);
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 8, 8, 8);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel instructionLabel = new JLabel("Instructions:");
        instructionLabel.setFont(UIStyle.SEMI_BOLD);
        JTextPane instructionArea = new JTextPane();
        instructionArea.setEditable(false);
        instructionArea.setPreferredSize(new Dimension(360, 100));
        JScrollPane instructScrollPane = new JScrollPane(instructionArea);

        JLabel paramLabel = new JLabel("Parameters:");
        JTextField paramField = new JTextField();
        paramField.setPreferredSize(new Dimension(220, 24));

        JButton startButton = new JButton("Start Experiment");
        JButton stopButton = new JButton("Stop Experiment");
        JButton downloadButton = new JButton("Download Report");
        startButton.setFont(UIStyle.SEMI_BOLD);
        stopButton.setFont(UIStyle.SEMI_BOLD);

        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        simDetailsPanel.add(instructionLabel, gbc);

        gbc.gridy = 1;
        simDetailsPanel.add(instructScrollPane, gbc);

        gbc.gridx = 0;
        gbc.gridy = 2;
        gbc.gridwidth = 1;
        simDetailsPanel.add(paramLabel, gbc);

        gbc.gridx = 1;
        simDetailsPanel.add(paramField, gbc);

        gbc.gridx = 0;
        gbc.gridy = 3;
        gbc.gridwidth = 2;
        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 0));
        actionPanel.setBackground(UIStyle.PANEL_BG);
        actionPanel.add(startButton);
        actionPanel.add(stopButton);
        actionPanel.add(downloadButton);
        simDetailsPanel.add(actionPanel, gbc);

        // bottom: experiment output
        JTextArea statusArea = new JTextArea(8, 48);
        statusArea.setEditable(false);
        statusArea.setFont(UIStyle.MONO);
        statusArea.setLineWrap(true);
        statusArea.setWrapStyleWord(true);
        JScrollPane outputScrollPane = new JScrollPane(statusArea);
        outputScrollPane.setBorder(BorderFactory.createTitledBorder("Experiment Output"));

        simPanel.add(leftPanel, BorderLayout.WEST);
        simPanel.add(simDetailsPanel, BorderLayout.CENTER);
        simPanel.add(outputScrollPane, BorderLayout.SOUTH);

        // ---------------- Behavior ----------------
        simList.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                String selected = simList.getSelectedValue();
                if (selected != null) {
                    Experiment exp = experiments.get(selected);
                    instructionArea.setText(exp == null ? "" : exp.getDetailedHtml());
                    paramField.setText(exp == null ? "" : "");
                }
            }
        });

        addButton.addActionListener(e -> {
            String newName = JOptionPane.showInputDialog(frame, "Enter new experiment name:");
            if (newName != null && !newName.trim().isEmpty()) {
                newName = newName.trim();
                Experiment ex = new Experiment(newName, "No instructions yet.", "");
                experiments.put(newName, ex);
                simModel.addElement(newName);
                statusBar.setText("Added experiment: " + newName);
                saveExperiments();
            }
        });

        editButton.addActionListener(e -> {
            int idx = simList.getSelectedIndex();
            if (idx != -1) {
                String curr = simModel.getElementAt(idx);
                Experiment ex = experiments.get(curr);
                String newName = (String) JOptionPane.showInputDialog(frame,
                        "Edit experiment details:", "Edit",
                        JOptionPane.PLAIN_MESSAGE, null, null, ex.getName());
                if (newName != null && !newName.trim().isEmpty()) {
                    newName = newName.trim();
                    // allow editing name and description
                    String newDesc = JOptionPane.showInputDialog(frame, "Edit description:", ex.getDescription());
                    if (newDesc == null) newDesc = ex.getDescription();
                    // update map, keep insertion order
                    experiments.remove(curr);
                    ex.setName(newName);
                    ex.setDescription(newDesc);
                    experiments.put(newName, ex);

                    simModel.set(idx, newName);
                    statusBar.setText("Experiment updated: " + newName);
                    saveExperiments();
                }
            }
        });

        deleteButton.addActionListener(e -> {
            int idx = simList.getSelectedIndex();
            if (idx != -1) {
                String name = simModel.getElementAt(idx);
                int ans = JOptionPane.showConfirmDialog(frame, "Delete experiment '" + name + "'?",
                        "Confirm Delete", JOptionPane.YES_NO_OPTION);
                if (ans == JOptionPane.YES_OPTION) {
                    simModel.remove(idx);
                    experiments.remove(name);
                    instructionArea.setText("");
                    statusBar.setText("Deleted experiment: " + name);
                    saveExperiments();
                }
            }
        });

        startButton.addActionListener(e -> {
            String selected = simList.getSelectedValue();
            String params = paramField.getText();
            if (selected == null) {
                statusArea.setText("⚠ Please select an experiment from the list.");
                statusBar.setText("No experiment selected");
                return;
            }
            Map<String, String> paramMap = validateParams(params);
            if (paramMap == null) {
                JOptionPane.showMessageDialog(frame,
                        "Parameter format error!\nPlease use: key1=val1, key2=val2, ...",
                        "Input Error", JOptionPane.ERROR_MESSAGE);
                statusArea.setText("⚠ Error: Invalid parameter format.");
                statusBar.setText("Parameter error!");
                return;
            }

            StringBuilder result = new StringBuilder();
            Experiment exp = experiments.get(selected);
            if (exp == null) {
                result.append("[Results not configured for this experiment!]");
            } else {
                switch (selected) {
                    case "Physics Oscillation":
                        result.append(SimulationLogic.runPhysics(paramMap));
                        break;
                    case "Chemical Reaction":
                        result.append(SimulationLogic.runChemical(paramMap));
                        break;
                    case "DNA Sequencing":
                        result.append(SimulationLogic.runDNA(paramMap));
                        break;
                    default:
                        result.append("[No simulation configured for this experiment]");
                }
            }

            String report = buildReport(selected, params, instructionArea.getText(), result.toString());
            statusArea.setText(report);
            lastReportText = report;
            history.add(report);
            statusBar.setText("Experiment completed: " + selected);
            // update history tab if visible
            updateHistoryArea();
        });

        stopButton.addActionListener(e -> {
            statusArea.setText("Experiment Stopped.");
            statusBar.setText("Experiment stopped");
        });

        downloadButton.addActionListener(e -> {
            if (lastReportText.isEmpty()) {
                JOptionPane.showMessageDialog(frame, "Run an experiment first to generate a report.");
                return;
            }
            JFileChooser fileChooser = new JFileChooser();
            fileChooser.setDialogTitle("Save Experiment Report");
            if (fileChooser.showSaveDialog(frame) == JFileChooser.APPROVE_OPTION) {
                File file = fileChooser.getSelectedFile();
                if (!file.getName().toLowerCase().endsWith(".txt")) {
                    file = new File(file.getAbsolutePath() + ".txt");
                }
                try (FileWriter fw = new FileWriter(file)) {
                    fw.write(lastReportText);
                    JOptionPane.showMessageDialog(frame, "Report downloaded!");
                } catch (IOException ex) {
                    JOptionPane.showMessageDialog(frame, "Error saving file: " + ex.getMessage());
                }
            }
        });

        return simPanel;
    }

    private JPanel buildHistoryTab() {
        JPanel historyPanel = new JPanel(new BorderLayout());
        historyPanel.setBackground(UIStyle.PAGE_BG);
        JLabel historyLabel = new JLabel("Previous experiments and results will be shown below.", SwingConstants.CENTER);
        historyLabel.setFont(UIStyle.ITALIC);
        historyPanel.add(historyLabel, BorderLayout.NORTH);

        JTextArea historyArea = new JTextArea();
        historyArea.setEditable(false);
        historyArea.setFont(UIStyle.MONO);
        historyArea.setLineWrap(true);
        historyArea.setWrapStyleWord(true);
        JScrollPane scroll = new JScrollPane(historyArea);
        historyPanel.add(scroll, BorderLayout.CENTER);

        // store the history area later for updates using client property
        historyPanel.putClientProperty("historyArea", historyArea);

        return historyPanel;
    }

    private JPanel buildAboutTab() {
        JPanel aboutPanel = new JPanel(new BorderLayout());
        aboutPanel.setBackground(UIStyle.PAGE_BG);
        JLabel aboutTitle = new JLabel("About Virtual Lab", SwingConstants.CENTER);
        aboutTitle.setFont(UIStyle.HEADER);
        JLabel aboutInfo = new JLabel(
                "<html><center>This virtual lab lets you perform and get simulated results for science experiments online.<br><br>"
                        + "Download your report, get feedback, and learn science concepts.<br><br>"
                        + "<b>Developed for college use - Virtual Lab Simulation Manager</b><br>"
                        + "Date: " + LocalDate.now() + "</center></html>", SwingConstants.CENTER);
        aboutInfo.setFont(UIStyle.PLAIN);
        aboutPanel.add(aboutTitle, BorderLayout.NORTH);
        aboutPanel.add(aboutInfo, BorderLayout.CENTER);
        return aboutPanel;
    }

    private void updateHistoryArea() {
        // find history tab's historyArea and update
        JTabbedPane tabs = findTabbedPane(frame.getContentPane());
        if (tabs == null) return;
        for (int i = 0; i < tabs.getTabCount(); i++) {
            if ("Experiment History".equals(tabs.getTitleAt(i))) {
                Component comp = tabs.getComponentAt(i);
                if (comp instanceof JPanel) {
                    JTextArea historyArea = (JTextArea) ((JPanel) comp).getClientProperty("historyArea");
                    if (historyArea == null) {
                        // fallback: locate text area by traversal
                        historyArea = findTextArea((JPanel) comp);
                        ((JPanel) comp).putClientProperty("historyArea", historyArea);
                    }
                    if (historyArea != null) {
                        historyArea.setText(String.join("\n\n--------------------\n\n", history));
                    }
                }
            }
        }
    }

    private static JTabbedPane findTabbedPane(Container c) {
        if (c instanceof JTabbedPane) return (JTabbedPane) c;
        for (Component comp : c.getComponents()) {
            if (comp instanceof Container) {
                JTabbedPane t = findTabbedPane((Container) comp);
                if (t != null) return t;
            }
        }
        return null;
    }

    private static JTextArea findTextArea(Container c) {
        for (Component comp : c.getComponents()) {
            if (comp instanceof JTextArea) return (JTextArea) comp;
            if (comp instanceof Container) {
                JTextArea t = findTextArea((Container) comp);
                if (t != null) return t;
            }
        }
        return null;
    }

    // -------------------- utilities --------------------
    private Map<String, String> validateParams(String input) {
        Map<String, String> map = new HashMap<>();
        if (input == null) return map; // allow empty map in some cases
        String trimmed = input.trim();
        if (trimmed.isEmpty()) return map;
        try {
            String[] pairs = trimmed.split(",");
            for (String pair : pairs) {
                if (pair.trim().isEmpty()) continue;
                String[] kv = pair.trim().split("=");
                if (kv.length != 2) return null;
                map.put(kv[0].trim().toLowerCase(), kv[1].trim());
            }
            return map;
        } catch (Exception ex) {
            return null;
        }
    }

    private String buildReport(String experiment, String params, String instructions, String result) {
        return "Experiment Report\n==================\nExperiment: " + experiment
                + "\nTime: " + LocalTime.now() + "\nParameters: " + params + "\n\nInstructions:\n"
                + instructions + "\n\nResult:\n" + result + "\n";
    }

    // -------------------- persistence --------------------
    private void saveExperiments() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(SAVE_FILE))) {
            oos.writeObject(experiments);
            // System.out.println("Saved experiments to " + SAVE_FILE);
        } catch (IOException e) {
            System.err.println("Failed to save experiments: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void loadExperiments() {
        File f = new File(SAVE_FILE);
        if (!f.exists()) return;
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(f))) {
            Object o = ois.readObject();
            if (o instanceof Map) {
                Map<String, Experiment> loaded = (Map<String, Experiment>) o;
                // merge loaded experiments preserving default insertion order (keep existing first)
                for (Map.Entry<String, Experiment> e : loaded.entrySet()) {
                    experiments.putIfAbsent(e.getKey(), e.getValue());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to load experiments: " + e.getMessage());
        }
    }

    // -------------------- small helper classes --------------------
    private static class Experiment implements Serializable {
        private String name;
        private String description;
        private String paramFormat;

        public Experiment(String name, String description, String paramFormat) {
            this.name = name;
            this.description = description;
            this.paramFormat = paramFormat;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getParamFormat() {
            return paramFormat;
        }

        public String getDetailedHtml() {
            return "Name: " + name + "\n\n" + description + "\n\nParameters (format): " + paramFormat;
        }
    }

    private static class SimulationLogic {
        public static String runPhysics(Map<String, String> paramMap) {
            try {
                double m = Double.parseDouble(paramMap.getOrDefault("mass", "0"));
                double k = Double.parseDouble(paramMap.getOrDefault("spring", "0"));
                double initial = Double.parseDouble(paramMap.getOrDefault("initial", "0"));
                if (m <= 0 || k <= 0) return "Error: mass and spring constant must be > 0";
                double period = 2 * Math.PI * Math.sqrt(m / k);
                return String.format("Result: Period = %.3f s\nAmplitude (initial displacement): %.3f m", period, initial);
            } catch (NumberFormatException ex) {
                return "Error: Invalid numeric parameter values!";
            }
        }

        public static String runChemical(Map<String, String> paramMap) {
            try {
                double a = Double.parseDouble(paramMap.getOrDefault("reactanta", "0"));
                double b = Double.parseDouble(paramMap.getOrDefault("reactantb", "0"));
                String tempStr = paramMap.getOrDefault("temp", "0");
                tempStr = tempStr.replace("C", "").replace("c", "");
                double temp = Double.parseDouble(tempStr);
                String type = (temp >= 60 && a > 0 && b > 0) ? "EXOTHERMIC" : "ENDOTHERMIC";
                return "Result: Reaction is " + type + " at " + temp + " °C\nReactants Used: " + a + " mol, " + b + " mol";
            } catch (NumberFormatException ex) {
                return "Error: Invalid numeric parameter values!";
            }
        }

        public static String runDNA(Map<String, String> paramMap) {
            String id = paramMap.getOrDefault("sampleid", "N/A");
            String type = paramMap.getOrDefault("type", "N/A");
            return "Result: Sequencing Complete.\nSample ID: " + id + "\nSequencing Type: " + type + "\nReport: Sequence contains 5,432 base pairs (example).";
        }
    }

    private static class UIStyle {
        static final Color PAGE_BG = new Color(245, 251, 255);
        static final Color PANEL_BG = new Color(240, 248, 255);
        static final Color PRIMARY = new Color(32, 70, 156);
        static final Color SECONDARY_TEXT = new Color(80, 80, 80);
        static final Font TITLE_FONT = new Font("Segoe UI", Font.BOLD, 26);
        static final Font HEADER = new Font("Segoe UI", Font.BOLD, 20);
        static final Font PLAIN = new Font("Segoe UI", Font.PLAIN, 15);
        static final Font SEMI_BOLD = new Font("Segoe UI", Font.BOLD, 13);
        static final Font MONO = new Font("Consolas", Font.PLAIN, 13);
        static final Font ITALIC = new Font("Segoe UI", Font.ITALIC, 15);
    }
}
